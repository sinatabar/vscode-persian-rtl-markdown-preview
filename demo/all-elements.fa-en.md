# آزمایش نمایش Markdown فارسی | Persian Preview Test

این فایل برای بررسی نمایش تیترها، متن فارسی، English text، فهرست، جدول، کد و جهت‌های ترکیبی در افزونه ساخته شده است.

This paragraph is entirely in English and should remain left-to-right in the Markdown preview.

## تایپوگرافی و متن ترکیبی

یک متن معمولی با **عبارت پررنگ**، *تأکید ایتالیک*، ~~متن حذف‌شده~~ و [لینک راهنمای Markdown](https://code.visualstudio.com/docs/languages/markdown).

Markdown Preview باید حتی وقتی جمله با واژهٔ انگلیسی آغاز می‌شود، به‌صورت راست‌به‌چپ و خوانا نمایش داده شود.

عبارت `inline code` داخل متن باید LTR، ایزوله و واضح باقی بماند. برای بازکردن Preview از <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>V</kbd> استفاده کنید.

### عنوان سطح سه با English keyword

#### Heading-first عنوانی است که با انگلیسی شروع می‌شود

##### عنوان سطح پنج

###### Heading level six — تیتر سطح شش

---

## فهرست‌ها

- یک گزینهٔ کاملاً فارسی
- Mixed text: این گزینه با عبارت انگلیسی آغاز می‌شود و سپس به فارسی ادامه پیدا می‌کند.
- Noto Sans Arabic: فونت همراه افزونه است و بدون نصب جداگانه بارگذاری می‌شود.
- This list item is entirely in English.
  - زیرگزینهٔ فارسی با `inline-code`
  - Nested item: این زیرگزینهٔ ترکیبی نیز باید راست‌به‌چپ باشد.

1. بازکردن یک فایل Markdown
2. Open Preview: اجرای پیش‌نمایش داخلی VS Code
3. بررسی جهت، فونت و خوانایی متن

- [x] نمایش تیترها و پاراگراف‌ها
- [x] پشتیبانی از متن English-first و فارسی
- [ ] بررسی روی سیستم‌عامل‌های دیگر

## نقل‌قول و هشدار

> یک نقل‌قول فارسی باید نوار کناری را در سمت راست داشته باشد.
>
> Note: این خط با انگلیسی شروع می‌شود اما ادامهٔ فارسی دارد.

## جدول داده

| نوع محتوا | جهت | نتیجهٔ مورد انتظار |
|---|---:|---|
| متن فارسی | RTL | خوانا و راست‌چین |
| Mixed content | RTL | ترکیب درست فارسی و English |
| English only | LTR | This cell stays readable in LTR |

## کد

کد کوتاه: `const locale = "fa-IR";`

```js
const preview = {
  locale: "fa-IR",
  direction: "rtl",
  bundledFont: "Persian RTL Preview"
};

console.log(preview);
```

```sql
SELECT language, direction
FROM markdown_preview
WHERE language IN ('fa', 'en');
```

## جزئیات تکمیلی

<details>
<summary>Details: نمایش توضیح فارسی</summary>

محتوای بازشونده می‌تواند شامل **متن فارسی** و `technical terms` باشد.

</details>

متن نهایی شامل H<sub>2</sub>O، توان x<sup>2</sup> و یک <mark>نکتهٔ مهم</mark> است.
