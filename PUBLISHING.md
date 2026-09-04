# Publishing

## Before the first release

1. Create a publisher in the Visual Studio Marketplace.
2. If its ID is not `sinatabar`, update `publisher` in `package.json`.
3. Create the public GitHub repository `sinatabar/vscode-persian-rtl-markdown-preview`, or update the repository URLs in `package.json`.
4. Push this directory to that repository.

## Verify and package

```sh
npm install
npm test
npm run package
```

The package command creates `persian-rtl-markdown-preview-1.0.0.vsix`. It can be shared directly before the Marketplace listing is live.

## Publish

Use either `npx vsce publish` after authenticating your publisher, or upload the VSIX manually from the Marketplace publisher management page.

Never commit an Azure DevOps token, an Entra secret, or any other publishing credential.
