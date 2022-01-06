# Publish Steps

- increase version number in package.json
- update changelog.md
- Run 'vsce publish'
- verify at: <https://marketplace.visualstudio.com/items?itemName=jeffjorczak.auto-translate-json>

# Bild Steps
- npm install
- npm install -g vsce
- vsce package
- you can use auto-translate-json-1.0.9.vsix to test extension