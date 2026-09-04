# آزمایش پیش‌نمایش فارسی

این پرونده برای بررسی تیترها، بندها، فهرست‌ها، جدول‌ها، قطعه‌های کد و جهت نوشتار در افزونه ساخته شده است.

# English preview test

This paragraph is entirely in English and should remain left-to-right in the preview.

## تایپوگرافی فارسی

یک متن معمولی با **عبارت پررنگ**، *تأکید ایتالیک*، ~~متن حذف‌شده~~ و [پیوند راهنما](https://code.visualstudio.com/docs/languages/markdown).

preview-direction: این نمونهٔ خنثی بررسی می‌کند که بند ترکیبی راست‌به‌چپ و خوانا نمایش داده شود.

عبارت `sample-code` داخل متن باید ایزوله و واضح باقی بماند. برای بازکردن پیش‌نمایش از <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>V</kbd> استفاده کنید.

### عنوان سطح سه فارسی

#### heading-preview: عنوانی خنثی برای بررسی شروع انگلیسی

##### عنوان سطح پنج

###### Heading level six — تیتر سطح شش

---

## فهرست‌ها

- یک گزینهٔ کاملاً فارسی
- mixed-preview: این گزینه برای بررسی جهت یک سطر ترکیبی است.
- bundled-font: این گزینه بارگذاری قلم همراه افزونه را بررسی می‌کند.
- This list item is entirely in English.
  - زیرگزینهٔ فارسی با `sample-code`
  - nested-preview: این زیرگزینه جهت نوشتار ترکیبی را بررسی می‌کند.

1. بازکردن یک پروندهٔ متنی
2. اجرای پیش‌نمایش داخلی
3. بررسی جهت، فونت و خوانایی متن

- [x] نمایش تیترها و پاراگراف‌ها
- [x] پشتیبانی از متن دوزبانه
- [ ] بررسی روی سیستم‌عامل‌های دیگر

## نقل‌قول و هشدار

> یک نقل‌قول فارسی باید نوار کناری را در سمت راست داشته باشد.
>
> preview-note: این خط خنثی برای بررسی نقل‌قول ترکیبی است.

## جدول داده

| نوع محتوا | جهت | نتیجهٔ مورد انتظار |
|---|---:|---|
| متن فارسی | راست‌به‌چپ | خوانا و راست‌چین |
| mixed-preview | راست‌به‌چپ | بررسی محتوای ترکیبی |
| English only | Left-to-right | This cell stays readable |

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
<summary>preview-details: نمایش توضیح فارسی</summary>

محتوای بازشونده می‌تواند شامل **متن فارسی** و `sample-code` باشد.

</details>

متن نهایی شامل H<sub>2</sub>O، توان x<sup>2</sup> و یک <mark>نکتهٔ مهم</mark> است.
