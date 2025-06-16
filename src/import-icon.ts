/* eslint-disable no-console */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import inquirer from 'inquirer';

import { loadOrCreateConfig } from './load-config';

/**
 * Imports a single icon from react-icons and generates a local wrapper file
 */
export async function importIcon(iconToImport?: string): Promise<void> {
    const config = await loadOrCreateConfig();
    let icon = iconToImport;

    if (!icon) {
        const { iconPrompted } = await inquirer.prompt([
            {
                type: 'input',
                name: 'iconPrompted',
                message: 'Enter the icon to import (e.g. ri/RiArrowLeftLine):',
            },
        ]);
        icon = iconPrompted.trim();
    }

    if (!icon) {
        console.log('❌ No icon specified. Please try again.');
        return;
    }

    const [set, iconName] = icon.split('/');
    if (!set || !iconName) {
        console.log('❌ Invalid icon format. Use format like ri/RiArrowLeftLine.');
        return;
    }

    console.log(`🔍 Looking for ${iconName} in react-icons/${set}/index.js...`);

    const iconFilePath = path.join(process.cwd(), `./node_modules/react-icons/${set}/index.js`);
    const fileContent = readFileSync(iconFilePath, 'utf-8');

    const regex = new RegExp(
        `module\\.exports\\.${iconName} = function .*?\\{\\s*return GenIcon\\((\\{[\\s\\S]*?\\})\\)\\(props\\);`,
        'm'
    );
    const match = fileContent.match(regex);

    if (!match?.[1]) {
        console.log(`❌ Icon ${icon} not found. Please try again.\n`);
        if (!iconToImport) return importIcon(); // Only retry for interactive CLI
        return;
    }

    const iconData: string = match[1];

    const content = `/* eslint-disable prettier/prettier */
import { GenIcon, IconBaseProps } from '${config.importPath}/GenIcon';
const ${iconName} = (props: IconBaseProps) => {
  return GenIcon(${iconData})(props);
};
export default ${iconName};
`;
    const outputDir = path.join(config.outputDir, 'icons');

    const outputFile = path.join(outputDir, `${iconName}.tsx`);
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(outputFile, content, 'utf-8');

    console.log(`✅ Icon ${iconName} generated at: ${outputFile}`);
}
