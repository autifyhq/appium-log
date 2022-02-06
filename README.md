# Appium Log Viewer

Chrome extension for Appium log viewer.

## Install the chrome extension

Clone this repository and

1. Open `chrome://extensions`
2. Click "Load unpacked"
3. Choose `/extension` folder in the cloned project

## Development

requirements

- Deno >= 1.18
- [denon](https://deno.land/x/denon)
  - file watcher like nodemon
- (recommended) [Deno for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

Build a bundle file with watcher.

```
denon dev
```

Make sure to update extension/content_script.js when you update & commit src/ because it's under git management.
