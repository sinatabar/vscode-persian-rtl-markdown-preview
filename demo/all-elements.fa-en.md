# راهنمای جامع محصول | Product Brief

این فایل برای بررسی همهٔ حالت‌های رایج Markdown ساخته شده است: متن فارسی، English text، نشانه‌گذاری، جدول، کد و جهت‌های ترکیبی.

This paragraph is entirely in English and must stay left-to-right. It also verifies that the extension does not force every block to RTL.

## تایپوگرافی و متن ترکیبی

یک متن معمولی با **عبارت پررنگ**، *تأکید ایتالیک*، ~~متن حذف‌شده~~ و [لینک مستندات VS Code](https://code.visualstudio.com/docs/languages/markdown).

API response باید حتی وقتی جمله با واژهٔ انگلیسی آغاز می‌شود، به‌صورت راست‌به‌چپ و خوانا نمایش داده شود.

عبارت `npm run build` داخل متن باید LTR، ایزوله و واضح باقی بماند. برای بازکردن Preview از <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>V</kbd> استفاده کنید.

### عنوان سطح سه با English keyword

#### Heading-first عنوانی است که با انگلیسی شروع می‌شود

##### عنوان سطح پنج

###### Heading level six — تیتر سطح شش

---

## فهرست‌ها

- یک گزینهٔ کاملاً فارسی
- Evidence ledger: هر ادعا باید منبع، تاریخ و سطح اطمینان داشته باشد.
- run-interview-case: اجرای سناریو از ابتدا تا انتها با یک شناسهٔ انگلیسی آغاز می‌شود.
- This list item is entirely in English.
  - زیرگزینهٔ فارسی با `inline-code`
  - Nested item: این زیرگزینه هم ترکیبی است.

1. مرحلهٔ اول: جمع‌آوری نیازها
2. Data model: تعریف موجودیت‌ها و روابط
3. مرحلهٔ سوم: کنترل کیفیت

- [x] نمایش تیترها و پاراگراف‌ها
- [x] پشتیبانی از متن English-first و فارسی
- [ ] بررسی روی سیستم‌عامل‌های دیگر

## نقل‌قول و هشدار

> یک نقل‌قول فارسی باید نوار کناری را در سمت راست داشته باشد.
>
> Note: این خط با انگلیسی شروع می‌شود اما ادامهٔ فارسی دارد.

## جدول داده

| شاخص | مقدار | توضیح |
|---|---:|---|
| نرخ تبدیل | ۲۴٪ | بهتر از baseline ماه قبل |
| API latency | ۱۸۰ ms | اندازه‌گیری‌شده در محیط تست |
| English only | 42 | This cell stays readable in LTR |

## کد

کد کوتاه: `const locale = "fa-IR";`

```js
const report = {
  locale: "fa-IR",
  direction: "rtl",
  mixedText: "Evidence ledger: هر ادعا باید منبع داشته باشد."
};

console.log(report);
```

```sql
SELECT user_id, conversion_rate
FROM analytics.daily_metrics
WHERE event_date >= DATE '2026-09-01';
```

## جزئیات تکمیلی

<details>
<summary>Details: نمایش توضیح فارسی</summary>

محتوای بازشونده می‌تواند شامل **متن فارسی** و `technical terms` باشد.

</details>

متن نهایی شامل H<sub>2</sub>O، توان x<sup>2</sup> و یک <mark>نکتهٔ مهم</mark> است.
