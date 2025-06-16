/* eslint-disable no-console */

import inquirer from 'inquirer';
import { importIcon } from './import-icon';
import { extractReactIconList, replaceReactIconsImports } from './extract-icon-list';
import { loadOrCreateConfig } from './load-config';
import { ensureBaseIconFiles } from './ensure-base-icon-files';
import { spinner } from './spinner';

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
  spinner.start()

  switch (action) {
    case 'import':
      await importIcon();
      spinner.success('Success!');
      break;
    case 'extract':
      await extractReactIconList();
      spinner.success('Success!');
      break;
    case 'extractAndImportAll': {
      const icons = await extractReactIconList();
      for (const icon of icons) {
        spinner.text = `📦 Importing icon: ${icon}`;
        await importIcon(icon);
      }
      spinner.success(`Success! ${icons.length} icons imported.`);
      break;
    }
    case 'fixImports':
      const count = await replaceReactIconsImports();
      const icons = await extractReactIconList();
      for (const icon of icons) {
        spinner.text = `📦 Importing icon: ${icon}`;
        await importIcon(icon);
      }
      spinner.success(`Success! ${count} import fixed.`);
      break;
    default:
      spinner.error('Unknown action.');
      process.exit(1);
  }
}
