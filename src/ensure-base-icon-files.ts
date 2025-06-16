import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadOrCreateConfig } from './load-config';
import { spinner } from './spinner';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseFiles = ['GenIcon.tsx', 'IconContext.tsx'];

export async function ensureBaseIconFiles(): Promise<void> {
    const config = await loadOrCreateConfig();
    const outputDir = path.resolve(process.cwd(), config.outputDir);

    for (const file of baseFiles) {
        const destPath = path.join(outputDir, file);
        const srcPath = path.join(__dirname, 'files/' + file);

        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
            spinner.text = `📁 Copied ${file} to ${outputDir}`;
        }
    }
}