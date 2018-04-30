# replx

> A TS/JS/ES REPL for your project.

`replx` is not your typical `node` or `ts-node` REPL. Features include:
* **Top-level `await`**
* **Use `import`/`export`** to your heart's content
* **Hot module reloading**. `replx` watches your imports and automatically re-imports them whenever they or any of their children change

## Install
```bash
# NPM
npm install --save-dev replx

# Yarn
yarn add -D replx
```

## Usage
Start `replx` by either entering `replx` or `repl` within your project.

## Configuration
You can configure `replx` using any file/format that [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) supports (i.e. a `replx` key within your `package.json` or a `.replxrc` or `replx.config.js` in your project's root directory).
