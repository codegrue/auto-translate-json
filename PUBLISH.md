# Publish Steps

- increase version number in package.json
- update changelog.md
- Run 'vsce publish'
- verify at: <https://marketplace.visualstudio.com/items?itemName=jeffjorczak.auto-translate-json>

## Build Steps

- npm install
- npm i  -g @vscode/vsce
- vsce package
