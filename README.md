<p align="center">
  <img src="images/icon.png" width="128" height="128" alt="Persian RTL Markdown Preview icon">
</p>

<h1 align="center">Persian RTL Markdown Preview</h1>

<p align="center">
  Edit and preview Persian/Farsi Markdown, text and subtitle files with correct RTL and mixed-language layout.
</p>

<p align="center">
  <a href="https://github.com/sinatabar/vscode-persian-rtl-markdown-preview/actions/workflows/ci.yml"><img src="https://github.com/sinatabar/vscode-persian-rtl-markdown-preview/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/sinatabar/vscode-persian-rtl-markdown-preview/releases/latest"><img src="https://img.shields.io/github/v/release/sinatabar/vscode-persian-rtl-markdown-preview" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/sinatabar/vscode-persian-rtl-markdown-preview" alt="MIT license"></a>
</p>

## فارسی

این افزونه یک ویرایشگر کامل فارسی برای پرونده‌های نشان‌گذاری، متن ساده و زیرنویس فراهم می‌کند. همچنین جهت نوشتار و چیدمان پیش‌نمایش داخلی ویژوال استودیو کد را اصلاح می‌کند. تیترها، بندها، فهرست‌ها، نقل‌قول‌ها و خانه‌های جدول به‌درستی راست‌به‌چپ می‌شوند.

متن‌های کاملاً انگلیسی و قطعه‌های کد چپ‌به‌راست باقی می‌مانند. اگر یک بند شامل هر دو زبان باشد، وجود نویسه‌های فارسی باعث می‌شود جهت پایهٔ همان بند راست‌به‌چپ انتخاب شود.

قلم فارسی همراه افزونه است و بدون نصب جداگانه بارگذاری می‌شود. ویرایشگر اختصاصی سه حالت ویرایش، پیش‌نمایش و نمایش دوبخشی دارد و تغییرات را مستقیماً در همان پرونده ذخیره می‌کند. فرمول‌ها به‌صورت متنی و قابل انتخاب نمایش داده می‌شوند و نمودارهای دیداری، فهرست کارها، پاورقی و فهرست مطالب نیز پشتیبانی می‌شوند.

برای نوشتار فارسی ابزار اصلاح حروف و نشانه‌ها، نیم‌فاصله و تبدیل رقم در دسترس است. قالب‌های رایج زیرنویس با زمان‌بندی چپ‌به‌راست، اعتبارسنجی، تشخیص هم‌پوشانی و تبدیل میان قالب‌ها نمایش داده می‌شوند. خروجی مستقل وب و چاپ یا ذخیره به سند نیز از داخل ویرایشگر ممکن است.

## English

This extension adds a full Persian RTL editor for Markdown, plain-text, SRT, WebVTT and ASS/SSA subtitle files, while continuing to fix text direction and layout in VS Code's built-in Markdown Preview. Persian blocks are rendered right-to-left, while English-only text and code remain left-to-right.

Mixed-language blocks are detected per block, including paragraphs, headings, lists, blockquotes, and table cells. The bundled Noto Sans Arabic font provides consistent offline rendering without requiring a separate font installation.

The custom editor supports edit, split and preview modes and saves through VS Code's normal text-document workflow, including Undo/Redo and dirty-file tracking. It also renders selectable MathML equations and Mermaid diagrams, validates subtitles, provides Persian writing tools, and exports HTML or print-ready PDF output. The original built-in Markdown Preview integration remains available.

## Preview

| Light | Dark |
| --- | --- |
| ![Light theme preview](images/preview-light.png) | ![Dark theme preview](images/preview-dark.png) |

## Features

- Optional Persian RTL Editor for `.md`, `.markdown`, `.mdown`, `.mkd`, `.txt`, `.srt`, `.vtt`, `.ass` and `.ssa` files.
- Edit, split and preview modes with normal VS Code Save and Undo/Redo behavior.
- Structured subtitle preview with LTR timestamps, validation, overlap warnings and SRT/WebVTT conversion.
- Native textual MathML powered by Temml, Mermaid diagrams, task lists, footnotes, heading anchors and generated tables of contents.
- Configurable direction, fonts, font scale, line height, preview width and default view mode.
- Synchronized editor/preview scrolling and remembered view mode; use `Ctrl/Cmd+Shift+1`, `2` or `3` to switch modes.
- Persian character, punctuation, half-space and digit normalization tools.
- Paste or drop images into Markdown, export standalone HTML, and print or save as PDF.
- Per-block RTL/LTR detection for paragraphs, headings, lists, blockquotes and table cells.
- Correct RTL layout when a mixed sentence begins with English text.
- LTR isolation for inline code and fenced code blocks.
- Theme-aware colors for light, dark and high-contrast themes.
- Bundles Noto Sans Arabic for consistent offline rendering; no system font installation required.
- Uses VS Code's official Markdown extension API; no core patching.
- No telemetry. Remote images are loaded only when referenced by the open document.
- Works in Restricted Mode.

## Install

### From a VSIX file

1. Download the `.vsix` file from the [latest GitHub release](https://github.com/sinatabar/vscode-persian-rtl-markdown-preview/releases/latest).
2. In VS Code, open **Extensions**.
3. Open the `…` menu and select **Install from VSIX…**.
4. Reload the VS Code window when prompted.

### Use

Open any `.md` file and run **Markdown: Open Preview**. The shortcut is `⌘⇧V` on macOS and `Ctrl+Shift+V` on Windows/Linux.

To edit a supported Markdown, text or subtitle file in the custom editor, open the Command Palette and run **Open with Persian RTL Editor**. You can also right-click the editor title and select the same command, or use **Reopen Editor With… → Persian RTL Editor**.

Use `[[toc]]` to insert a table of contents. Math uses `$inline$` or `$$block$$` syntax. Mermaid diagrams use a fenced `mermaid` code block. Editor appearance and default behavior can be changed under **Settings → Persian RTL Editor**.

The custom editor is optional. VS Code's standard text editor and built-in Markdown Preview remain available at any time.

## How it works

The extension inspects each rendered block. A block containing Persian or Arabic-script characters receives an explicit RTL direction; English-only blocks remain LTR. Code and SRT timestamps are always isolated as LTR. The editor uses VS Code's Custom Text Editor API, so changes participate in the normal document, save and undo lifecycle.

## Development

```sh
npm install
npm test
npm run package
```

The package command creates a distributable `.vsix` file.

## Contributing

Bug reports and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing. For security issues, follow [SECURITY.md](SECURITY.md).

## License

The extension code is MIT licensed © [Sina Tabar](https://github.com/sinatabar). The bundled Noto Sans Arabic font is distributed under the [SIL Open Font License 1.1](fonts/OFL-1.1.txt).
