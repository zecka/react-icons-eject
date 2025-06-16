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

    const { outputDir, importPath, forceScanDir } = await inquirer.prompt([
        {
            type: 'input',
            name: 'outputDir',
            message: 'Output folder for generated icons:',
            default: './src/components/atoms/icons/react-icons',
        },
        {
            type: 'input',
            name: 'importPath',
            message: 'Import path to use in generated files:',
            default: 'src/components/atoms/icons/react-icons',
        },
        {
            type: 'input',
            name: 'forceScanDir',
            message: '(Optional) Force scan directories (comma-separated):',
            default: '',
        },
    ]);

    const forceDirs = forceScanDir
        .split(',')
        .map((d: string) => d.trim())
        .filter(Boolean);

    const typeContent = fs.readFileSync(path.resolve(__dirname, 'types.ts'), 'utf-8');

    const configObjectLines = [
        `  outputDir: '${outputDir}',`,
        `  importPath: '${importPath}',`,
        ...(forceDirs.length > 0 ? [`  forceScanDir: ${JSON.stringify(forceDirs)},`] : []),
    ];

    const content = `${typeContent}

const config: ReactIconsEjectConfig = {
${configObjectLines.join('\n')}
};

export default config;
`;

    console.log('\n📦 Configuration summary:');
    console.log(`  → Icons will be saved in:      ${outputDir}`);
    console.log(`  → Example import statement:\n`);
    console.log(`    import RiExampleIcon from '${importPath}/icons/RiExampleIcon';\n`);
    if (forceDirs.length > 0) {
        console.log(`  → Forced scan directories:     ${forceDirs.join(', ')}`);
    }

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Do you want to save this configuration?',
            default: true,
        },
    ]);

    if (!confirm) {
        console.log('❌ Configuration cancelled. No file was created.');
        process.exit(0);
    }

    fs.writeFileSync(configPath, content, 'utf-8');

    console.log(`✅ Config file created at: ${CONFIG_FILENAME}`);

    return {
        outputDir,
        importPath,
        ...(forceDirs.length > 0 ? { forceScanDir: forceDirs } : { forceScanDir: [] }),
    };
}
