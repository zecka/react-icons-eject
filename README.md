# 🧱 react-icons-eject

[![npm](https://img.shields.io/npm/v/react-icons-eject?color=crimson&label=npm)](https://www.npmjs.com/package/react-icons-eject)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/react-icons-eject?label=minzipped%20size)](https://www.npmjs.com/package/react-icons-eject)
[![downloads](https://img.shields.io/npm/dw/react-icons-eject?label=downloads)](https://www.npmjs.com/package/react-icons-eject)
![types](https://img.shields.io/badge/types-TypeScript-blue)

**Tree-shake your react-icons!**  

This tool scans your project for `react-icons` usage, extracts only the icons you actually use, and rewrites imports to point to local components — giving you full control over how icons are loaded and potentially improving bundle optimization in frameworks like Next.js.

---

## ✨ Features

- ✅ Replace all `react-icons` imports with local icon components
- 🔍 Detect and list all used `react-icons` in your project
- 📦 Generate locally scoped `GenIcon` wrappers for optimal tree-shaking
- ⚙️ Customizable import paths and output directories via config file
- 🛠️ Designed for TypeScript projects (`.ts`, `.tsx`) using ESM
---

## 📦 Installation

```bash
npm install -g react-icons-eject
```

Or use without installing globally:

```bash
npx react-icons-eject
```

---

## 🚀 Usage

Just run:

```bash
react-icons-eject
```

You'll be prompted with several actions:

### 1. Replace all `react-icons` imports with local icon imports

> Rewrites your imports like:
```ts
import { RiPlayLine } from 'react-icons/ri';
```
> into:
```ts
import RiPlayLine from '@/icons/ri/RiPlayLine';
```

### 2. Import a single icon from react-icons and generate a local version

> Allows you to generate only one icon like `ri/RiPlayLine` into your custom directory.

### 3. Scan the project and list all `react-icons` used

> Outputs a `icons-list.ts` file containing all used icon identifiers in your project.

### 4. Scan and locally generate all `react-icons` used in the project

> Automatically extracts all icons you're using and generates them locally.

---


## ⚠️ Limitations

This tool is designed with the following assumptions:

- 📁 Your project uses **ES module syntax** (`import` / `export`) — `require()` and CommonJS are not supported.
- 🧠 It scans `.ts`, `.tsx`, `.js`, and `.jsx` files, but:
  - ⚠️ Only **ESM-based JavaScript** (`import { ... } from 'react-icons/ri'`) is supported
  - ✅ Generated icons are written as `.tsx` files — intended for **TypeScript + React** projects

If you're using plain JavaScript and want `.js` output, feel free to open an issue or submit a PR.

---


## 🧩 Configuration

On first run, you'll be prompted to create a `react-icon-eject.config.ts` file like this:

```ts
// react-icon-eject.config.ts
export const config = {
  outputDir: './src/components/icons',             // Directory where icons are written
  importPath: '@/components/icons',                // Path used in rewritten imports
};
```

> `GenIcon.tsx` and `IconContext.tsx` will be copied automatically to `outputDir` (if not already present).

---

## 🤔 Why?

Using `react-icons` out of the box imports entire icon sets like `react-icons/ri`, which can:

- Break tree-shaking in some build tools
- Slow down your dev server and production builds
- Introduce unnecessary dependencies into your bundle

This tool helps by:

- Extracting only the icons you actually use
- Rewriting imports to static, local files
- Giving you full control over how icons are loaded and used

---

## 📄 License

MIT – free to use and modify.
