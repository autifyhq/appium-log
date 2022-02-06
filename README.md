# Appium Log Viewer

Chrome extension for Appium log viewer.

<img width="1279" alt="screenshot" src="https://user-images.githubusercontent.com/16313897/152668647-f7adcea6-7363-4a4e-98cf-1b19ca8ccb53.png">


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
