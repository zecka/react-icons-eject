import { execa } from 'execa';
import inquirer from 'inquirer';
import chalk from 'chalk';

export async function confirmDestructiveAction(): Promise<boolean> {
    let hasUncommittedChanges = false;

    try {
        const { stdout } = await execa('git', ['status', '--porcelain']);
        hasUncommittedChanges = stdout.trim().length > 0;
        if (!hasUncommittedChanges) {
            return true; // No uncommitted changes, no need to confirm
        }
    } catch {
        // Ignore error if not in a Git repo
    }

    const warningMessage = `${chalk.yellow('⚠️  Warning:')} You have uncommitted changes. It's recommended to commit or stash them before proceeding.\n\nThis command will modify multiple files by replacing react-icons imports with local ones.\n\n`


    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: warningMessage + 'Are you sure you want to continue?',
            default: false,
        },
    ]);
    console.log(`\n\n`);
    return confirm;
}
