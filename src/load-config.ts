import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath, pathToFileURL } from 'url';

import type { ReactIconsEjectConfig } from './types';

const CONFIG_FILENAME = 'react-icon-eject.config.ts';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadOrCreateConfig(): Promise<ReactIconsEjectConfig> {
    const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);

    if (fs.existsSync(configPath)) {
        const configUrl = pathToFileURL(configPath).href;
        const configModule = await import(configUrl);
        return configModule.default as ReactIconsEjectConfig;
    }

    console.log(`⚙️ No ${CONFIG_FILENAME} found. Let's create one.`);

    const { outputDir, importPath } = await inquirer.prompt([
        {
            type: 'input',
            name: 'outputDir',
            message: 'Output folder for generated icons:',
            default: './src/components/atoms/icons/react-icons/icons',
        },
        {
            type: 'input',
            name: 'importPath',
            message: 'Import path to use in generated files:',
            default: 'src/components/atoms/icons/react-icons',
        },
    ]);
    const typeContent = fs.readFileSync(path.resolve(__dirname, 'types.ts'), 'utf-8');
    const content = `${typeContent}

const config: ReactIconsEjectConfig = {
  outputDir: '${outputDir}',
  importPath: '${importPath}',
};

export default config;
`;

    fs.writeFileSync(configPath, content, 'utf-8');
    console.log(`✅ Config file created at: ${CONFIG_FILENAME}`);

    return { outputDir, importPath };
}
