/* eslint-disable no-console */
import path from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import fs from 'fs';
import { globby } from 'globby';
import inquirer from 'inquirer';
import { execa } from 'execa';

import generateModule from '@babel/generator';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import * as t from '@babel/types';
const traverse = (traverseModule as any).default || traverseModule;
const generate = (generateModule as any).default || generateModule;

import { loadOrCreateConfig } from './load-config';
import { spinner } from './spinner';
import chalk from 'chalk';
import { importIcon } from './import-icon';

const projectRoot = process.cwd();

function getImportedIconName(specifier: t.ImportSpecifier): string | undefined {
    return t.isIdentifier(specifier.imported)
        ? specifier.imported.name
        : t.isStringLiteral(specifier.imported)
            ? specifier.imported.value
            : undefined;
}

async function getProjectFiles(): Promise<string[]> {
    const { forceScanDir = [] } = await loadOrCreateConfig();


    const reincludedPaths = forceScanDir
        .map(dir => path.relative(projectRoot, path.resolve(projectRoot, dir)))

    const files = await globby(['**/*.{ts,tsx}'], {
        cwd: projectRoot,
        absolute: true,
        gitignore: true,
    });
    for (const dir of reincludedPaths) {
        const absoluteDir = path.resolve(projectRoot, dir);
        const forcedFiles = await globby(['**/*.{ts,tsx}'], {
            cwd: absoluteDir,
            absolute: true,
            gitignore: true,
        });
        files.push(...forcedFiles)
    }

    return files;
}

function walkImportDeclarations(
    code: string,
    callback: (path: import('@babel/traverse').NodePath<t.ImportDeclaration>, set: string) => void,
): string | null {
    let ast;
    try {
        ast = parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });
    } catch {
        return null;
    }

    let hasChanged = false;

    traverse(ast, {
        ImportDeclaration(p) {
            const source = p.node.source.value;
            if (!source.startsWith('react-icons/')) return;

            const set = source.split('/')[1];
            if (!set) return;

            callback(p, set);
            hasChanged = true;
        },
    });

    return hasChanged ? generate(ast, { retainLines: true }).code : null;
}
export async function extractAndImportAllIcons(): Promise<void> {
    const icons = await extractReactIconList();
    for (const icon of icons) {
        spinner.text = `📦 Importing icon: ${icon}`;
        await importIcon(icon);
    }
    spinner.success(`Success! ${icons.length} icons imported.`);
}
export async function extractReactIconList(): Promise<string[]> {
    const config = await loadOrCreateConfig();
    // Get current icon list content
    const iconsListPath = path.resolve(projectRoot, config.outputDir, 'icons-list.ts');
    const reactIconsSet = new Set<string>();
    if (fs.existsSync(iconsListPath)) {
        const existingContent = await import(iconsListPath);
        if (existingContent.default && Array.isArray(existingContent.default)) {
            for (const icon of existingContent.default) {
                if (typeof icon === 'string') {
                    reactIconsSet.add(icon);
                }
            }
        }
    }

    const files = await getProjectFiles();

    for (const file of files) {
        const code = readFileSync(file, 'utf-8');

        walkImportDeclarations(code, (p, set) => {
            for (const specifier of p.node.specifiers) {
                if (t.isImportSpecifier(specifier)) {
                    const icon = getImportedIconName(specifier);
                    if (icon) reactIconsSet.add(`${set}/${icon}`);
                }
            }
        });
    }

    // Include already generated icons

    const iconsDirBase = path.resolve(projectRoot, config.outputDir);
    const iconsDir = path.join(iconsDirBase, 'icons');
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    let iconFiles: string[] = [];
    try {
        iconFiles = readdirSync(iconsDir).filter(f => f.endsWith('.tsx'));
    } catch { }

    for (const file of iconFiles) {
        const content = readFileSync(path.join(iconsDir, file), 'utf-8');
        const match = content.match(/const (\w+)/);
        if (match?.[1]) {
            const icon = match[1];
            const possibleSets = [
                'ri', 'fa', 'md', 'ai', 'io', 'bs', 'bi', 'cg', 'ci',
                'fi', 'gi', 'go', 'gr', 'hi', 'im', 'si', 'sl', 'tb', 'ti', 'vsc',
            ];
            const foundSet = possibleSets.find(set => icon.toLowerCase().startsWith(set));
            if (foundSet) reactIconsSet.add(`${foundSet}/${icon}`);
        }
    }

    const iconsList = Array.from(reactIconsSet).sort();
    const output = `/* eslint-disable */\nconst reactIconsList = ${JSON.stringify(iconsList, null, 2).replace(/"/g, "'")};
export default reactIconsList;
`;

    const outputPath = path.resolve(projectRoot, config.outputDir, 'icons-list.ts');
    // Create folder if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    writeFileSync(outputPath, output, 'utf-8');

    spinner.text = `✅ Icon list generated in: ${outputPath}`;
    return iconsList;
}

export async function replaceReactIconsImports(): Promise<number> {
    const config = await loadOrCreateConfig();
    spinner.text = '🔄 Replacing react-icons imports with local imports…';

    const files = await getProjectFiles();
    const modifiedFiles: string[] = [];
    let count = 0;

    for (const file of files) {
        const code = readFileSync(file, 'utf-8');
        const updatedCode = walkImportDeclarations(code, (p, _set) => {
            const newImports: t.ImportDeclaration[] = [];

            for (const specifier of p.node.specifiers) {
                if (t.isImportSpecifier(specifier)) {
                    const importedIcon = getImportedIconName(specifier);
                    if (importedIcon) {
                        const localName = specifier.local.name;
                        const importPath = `${config.importPath}/icons/${importedIcon}`;
                        const newImport = t.importDeclaration(
                            [t.importDefaultSpecifier(t.identifier(localName))],
                            t.stringLiteral(importPath)
                        );
                        newImports.push(newImport);
                        count++;
                    }
                }
            }

            if (newImports.length > 0) {
                p.replaceWithMultiple(newImports);
            }
        });

        if (updatedCode) {
            writeFileSync(file, updatedCode, 'utf-8');
            spinner.text = `✅ Rewritten imports in: ${path.relative(projectRoot, file)}`;
            modifiedFiles.push(file);
        }
    }

    spinner.stop('✅ All react-icons imports have been replaced. \n');
    spinner.clear();
    // 🧹 Optionally run eslint --fix on modified files
    const eslintPath = path.resolve(process.cwd(), 'node_modules/.bin/eslint');
    const hasEslint = fs.existsSync(eslintPath);
    if (hasEslint && modifiedFiles.length > 0) {
        const { confirmLint } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmLint',
                message: 'ESLint detected. Do you want to auto-format the modified files?',
                default: true,
            },
        ]);

        if (confirmLint) {
            console.log('\n');
            spinner.start('🧼 Running ESLint on modified files…\n');
            await execa('npx', ['eslint', '--fix', ...modifiedFiles], {
                stdio: 'inherit',
            });
        } else {
            console.log(
                '\n' +
                chalk.blue('ℹ️  You may want to lint your files using a command like ') +
                chalk.cyan('npm run lint --fix') +
                chalk.blue(', depending on your project setup.\n')
            );
        }
    }

    return count;
}