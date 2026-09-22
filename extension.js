const { PersianRtlEditorProvider } = require("./custom-editor");
const { addBlockDirections, applyBlockDirections } = require("./markdown-direction");

function activate(context) {
  const api = {
    extendMarkdownIt(markdownIt) {
      return addBlockDirections(markdownIt);
    }
  };

  if (context) {
    const vscode = require("vscode");
    const provider = new PersianRtlEditorProvider(vscode, context);
    context.subscriptions.push(
      vscode.window.registerCustomEditorProvider("persianRtl.editor", provider, {
        webviewOptions: { retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false
      }),
      vscode.commands.registerCommand("persianRtl.openEditor", () => {
        const uri = vscode.window.activeTextEditor?.document.uri;
        if (!uri) return;
        return vscode.commands.executeCommand("vscode.openWith", uri, "persianRtl.editor");
      })
    );
  }

  return api;
}

module.exports = { activate, applyBlockDirections };
