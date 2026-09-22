<p align="center">
  <img src="images/icon.png" width="128" height="128" alt="Persian RTL Markdown Preview icon">
</p>

<h1 align="center">Persian RTL Markdown Preview</h1>

<p align="center">
  Edit and preview Persian/Farsi Markdown, TXT and SRT with correct RTL and mixed-language layout.
</p>

<p align="center">
  <a href="https://github.com/sinatabar/vscode-persian-rtl-markdown-preview/actions/workflows/ci.yml"><img src="https://github.com/sinatabar/vscode-persian-rtl-markdown-preview/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/sinatabar/vscode-persian-rtl-markdown-preview/releases/latest"><img src="https://img.shields.io/github/v/release/sinatabar/vscode-persian-rtl-markdown-preview" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/sinatabar/vscode-persian-rtl-markdown-preview" alt="MIT license"></a>
</p>

## فارسی

این افزونه یک ویرایشگر فارسی برای پرونده‌های نشان‌گذاری، متن ساده و زیرنویس فراهم می‌کند. همچنین جهت نوشتار و چیدمان پیش‌نمایش داخلی را اصلاح می‌کند. تیترها، بندها، فهرست‌ها، نقل‌قول‌ها و خانه‌های جدول به‌درستی راست‌به‌چپ می‌شوند.

متن‌های کاملاً انگلیسی و قطعه‌های کد چپ‌به‌راست باقی می‌مانند. اگر یک بند شامل هر دو زبان باشد، وجود نویسه‌های فارسی باعث می‌شود جهت پایهٔ همان بند راست‌به‌چپ انتخاب شود.

قلم فارسی همراه افزونه است و بدون نصب جداگانه یا اتصال اینترنت بارگذاری می‌شود. ویرایشگر اختصاصی سه حالت ویرایش، پیش‌نمایش و نمایش دوبخشی دارد و تغییرات را مستقیماً در همان پرونده ذخیره می‌کند. در زیرنویس‌ها، زمان‌بندی چپ‌به‌راست و گفت‌وگوهای فارسی راست‌به‌چپ نمایش داده می‌شوند.

## English

This extension adds an optional Persian RTL editor for Markdown, plain-text and SRT subtitle files, while continuing to fix text direction and layout in VS Code's built-in Markdown Preview. Persian blocks are rendered right-to-left, while English-only text and code remain left-to-right.

Mixed-language blocks are detected per block, including paragraphs, headings, lists, blockquotes, and table cells. The bundled Noto Sans Arabic font provides consistent offline rendering without requiring a separate font installation.

The custom editor supports edit, split and preview modes and saves through VS Code's normal text-document workflow, including Undo/Redo and dirty-file tracking. The original built-in Markdown Preview integration remains available.

## Preview

| Light | Dark |
| --- | --- |
| ![Light theme preview](images/preview-light.png) | ![Dark theme preview](images/preview-dark.png) |

## Features

- Optional Persian RTL Editor for `.md`, `.markdown`, `.txt` and `.srt` files.
- Edit, split and preview modes with normal VS Code Save and Undo/Redo behavior.
- Structured SRT preview with LTR timestamps and independently directed subtitle text.
- Per-block RTL/LTR detection for paragraphs, headings, lists, blockquotes and table cells.
- Correct RTL layout when a mixed sentence begins with English text.
- LTR isolation for inline code and fenced code blocks.
- Theme-aware colors for light, dark and high-contrast themes.
- Bundles Noto Sans Arabic for consistent offline rendering; no system font installation required.
- Uses VS Code's official Markdown extension API; no core patching.
- No settings, telemetry, runtime dependencies or network requests.
- Works in Restricted Mode.

## Install

### From a VSIX file

1. Download the `.vsix` file from the [latest GitHub release](https://github.com/sinatabar/vscode-persian-rtl-markdown-preview/releases/latest).
2. In VS Code, open **Extensions**.
3. Open the `…` menu and select **Install from VSIX…**.
4. Reload the VS Code window when prompted.

### Use

Open any `.md` file and run **Markdown: Open Preview**. The shortcut is `⌘⇧V` on macOS and `Ctrl+Shift+V` on Windows/Linux.

To edit a Markdown, TXT or SRT file in the custom editor, open the Command Palette and run **Open with Persian RTL Editor**. You can also right-click the editor title and select the same command, or use **Reopen Editor With… → Persian RTL Editor**.

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
