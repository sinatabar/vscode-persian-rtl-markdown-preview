const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.join(__dirname, "..");
const vendor = path.join(root, "webview", "vendor");

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.rmSync(vendor, { recursive: true, force: true });
fs.mkdirSync(vendor, { recursive: true });
fs.copyFileSync(path.join(root, "node_modules", "mermaid", "dist", "mermaid.min.js"), path.join(vendor, "mermaid.min.js"));
fs.copyFileSync(path.join(root, "node_modules", "temml", "dist", "Temml-Local.css"), path.join(vendor, "temml.css"));
fs.copyFileSync(path.join(root, "node_modules", "temml", "dist", "Temml.woff2"), path.join(vendor, "Temml.woff2"));

esbuild.buildSync({
  entryPoints: [path.join(root, "extension.js")],
  bundle: true,
  platform: "node",
  target: "node16",
  // markdown-it-texmath contains a legacy fallback import for KaTeX. Route that
  // unreachable fallback to the same MathML renderer so KaTeX is not bundled.
  alias: { katex: require.resolve("temml") },
  external: ["vscode"],
  outfile: path.join(root, "dist", "extension.js")
});
