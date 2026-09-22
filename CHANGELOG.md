# Changelog

## 1.2.1 - 2026-09-22

- Derive Mermaid node, text, border and arrow colors from the active VS Code theme for reliable contrast.
- Detect the direction of every Mermaid label independently so Persian and mixed-language labels keep a readable order.
- Keep mixed Persian/Latin Mermaid labels such as `پیش‌نمایش RTL` in the intended reading order.
- Make Print/PDF open a standalone printable preview and trigger the system print dialog reliably.

## 1.2.0 - 2026-09-22

- Render safe inline HTML in the custom Markdown preview instead of showing its source tags.
- Resolve local relative images through the VS Code webview resource system.
- Allow HTTPS and data images while continuing to remove scripts, event handlers and unsafe URLs.
- Add WebVTT, ASS/SSA and additional Markdown filename support.
- Add subtitle validation, overlap warnings, cue statistics and SRT/WebVTT conversion.
- Add configurable direction, font sizes, line height, content width and default view mode.
- Add synchronized scrolling, remembered view mode, keyboard shortcuts and reading statistics.
- Add task lists, footnotes, heading anchors, table of contents, native textual MathML powered by Temml, and Mermaid diagrams.
- Isolate inline and block equations from surrounding RTL text so superscripts, subscripts and fractions keep their mathematical order.
- Add Persian normalization, half-space and Persian/Latin digit tools.
- Add pasted or dropped image saving, standalone HTML export and print/PDF output.
- Bundle runtime dependencies to reduce the packaged extension from hundreds of files to a compact distribution.

## 1.1.0

- Add an optional Persian RTL custom editor for Markdown, TXT and SRT files.
- Add edit, split and preview modes with direct file editing and VS Code Save/Undo integration.
- Add structured SRT preview with isolated LTR timestamps and RTL/LTR dialogue detection.
- Keep the existing built-in Markdown Preview integration unchanged.

## 1.0.2

- Separate Persian and English Marketplace details to prevent bidirectional layout issues.
- Replace mixed-language examples with neutral preview-related wording.

## 1.0.1

- Bundle the variable Noto Sans Arabic font for consistent Persian and mixed-language rendering.
- Include Arabic and Latin WOFF2 subsets so the preview works offline without a system font installation.
- Include the SIL Open Font License 1.1 with the packaged font files.

## 1.0.0

- Add block-aware Persian and Arabic RTL rendering.
- Keep mixed Persian-English blocks RTL even when English appears first.
- Keep pure English text, inline code, and fenced code LTR.
- Add RTL-aware list and blockquote styling.
- Prefer the Noto Sans font family for Persian text when available.
