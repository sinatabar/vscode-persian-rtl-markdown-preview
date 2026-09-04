# Publishing to the VS Code Marketplace

The public extension name is **Persian RTL Markdown Preview** and its package identifier is `persian-rtl-markdown-preview`. The `publisher` field is currently `sinatabar`.

## Recommended first release: manual upload

1. Sign in to [Visual Studio Marketplace management](https://marketplace.visualstudio.com/manage) with a Microsoft account.
2. Create a publisher. Use `sinatabar` as its ID if available; otherwise update the `publisher` value in `package.json` to the ID you create.
3. Open the publisher dashboard and choose **New extension → Visual Studio Code**.
4. Upload the latest `persian-rtl-markdown-preview-<version>.vsix` from the latest GitHub release or from this project directory.
5. Review the icon, README, repository, license, categories and public visibility, then publish.
6. Install the Marketplace version in a clean VS Code profile and repeat the demo-file preview check.

Official guide: [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Build the VSIX again

```sh
npm ci
npm test
npm run package
```

## Later releases

Increment `version` in `package.json`, update `CHANGELOG.md`, run the checks above, create a GitHub release and upload the new VSIX to the Marketplace.

Microsoft recommends Microsoft Entra ID–based authentication for automated publishing. Global Azure DevOps PATs are scheduled for retirement on December 1, 2026. Manual VSIX upload is simpler for the first release and does not require storing a publishing token.

Never commit an Azure DevOps token, Microsoft Entra secret or other publishing credential.
