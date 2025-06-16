/* eslint-disable no-console */

import inquirer from 'inquirer';
import { importIcon } from './import-icon';
import { extractAndImportAllIcons, extractReactIconList, replaceReactIconsImports } from './extract-icon-list';
import { loadOrCreateConfig } from './load-config';
import { ensureBaseIconFiles } from './ensure-base-icon-files';
import { spinner } from './spinner';
import chalk from 'chalk';
import { confirmDestructiveAction } from './confirm-destructive-action';

export async function main() {
  await loadOrCreateConfig();
  await ensureBaseIconFiles();
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: [
        { name: '1) Replace all react-icons imports with local icon imports', value: 'fixImports' },
        { name: '2) Import a single icon from react-icons and generate a local version', value: 'import' },
        { name: '3) Scan the project and list all react-icons used', value: 'extract' },
        { name: '4) Scan and locally generate all react-icons used in the project', value: 'extractAndImportAll' },
      ],
    },
  ]);

  switch (action) {
    case 'import':
      spinner.start()
      await importIcon();
      spinner.success('Success!');
      break;
    case 'extract':
      spinner.start()
      await extractReactIconList();
      spinner.success('Success!');
      break;
    case 'extractAndImportAll':
      spinner.start()
      await extractAndImportAllIcons()
      break;
    case 'fixImports':
      // Force user to confirm that all change is commit before proceeding
      const confirm = await confirmDestructiveAction();
      if (!confirm) {
        spinner.error('Action cancelled by user.');
        process.exit(0);
      }
      await extractAndImportAllIcons()
      const count = await replaceReactIconsImports();
      if (count === 0) {
        spinner.error('No react-icons imports found to replace.');
        process.exit(0);
      }

      spinner.success(`Success! ${count} import fixed.`);

      break;
    default:
      spinner.error('Unknown action.');
      process.exit(1);
  }
}
