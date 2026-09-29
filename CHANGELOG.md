# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### TODO

- `SalarySlipGeneratorView`: `payPeriod` — заменить text input на два `<Select>` (Month + Year), локализовать, `payMonth` / `payYear` в state
- Currency formatting: RUB после числа, `toLocaleString(locale, ...)` для чисел
- Extract `CurrencySelect` — `CURRENCIES` / `CURRENCY_SYMBOLS` дублируются в 3 файлах
- `ToolSchema`: убрать `<ProjectName>` из `publisher.name`
- `types/common.ts`: вынести `FAQItem` (дублируется)
- Аудит `placeholder` / `defaultValue` на хардкод английского
- Проверить остальные Base UI компоненты (`Select`, `DropdownMenu`, `Tooltip`, `SidebarSettings`) на focus-guards
- Убрать `display: contents` wrapper после апдейта `@base-ui/react` (PR #4350)
- `CURRENT_YEAR` — обернуть в `useMemo` внутри компонента
- `CalculatorForm`: заменить `<input type="date">` на `DatePicker` для `age-calculator`
- Активная ссылка категории в сайдбаре — slug → category (сейчас `===`)
- Sidebar state сбрасывается при смене локали
- Mobile sidebar (Sheet) не протестирован
- `meta-tag-generator`: заголовки превью (`"Google search preview"` и т.д.) захардкожены на EN
- OG image (`og-default.jpg`), AdSense, GA

## [0.4.0] - 2026-09-29

### Added

**Developer tools (7 new)**

- Color Picker — HEX / RGB / HSL / HSV, `react-colorful` SV-square + hue slider, tints & shades, 5 harmonious palettes
- Color Contrast Checker — WCAG 2.1 AA / AAA, live Google / Twitter / Facebook previews, swap
- Markdown Previewer — live split-view, GFM, DOMPurify, HTML export
- SQL Formatter & Minifier — format / minify, keyword case, indent, comment stripping
- Code Minifier — HTML / CSS / JS, size comparison, Terser for JS (safe mode)
- Meta Tag Generator — title / description / OG / Twitter Card / keywords / robots, live previews, tabs, HTML output
- Git Ignore Generator — 30+ templates, quick presets, search, custom rules, deduplication

**Business tools (7 new)**

- Invoice Generator — form + sticky preview, line items, tax, discount, logo upload, print / PDF
- Invoice Number Generator — prefix + starting number, «Next available» tracker, client / notes, table
- UTM Link Builder — 5 UTM parameters, live assembly, copy
- Profit Margin & Markup Calculator — three blocks: cost + price → margin, cost + target margin → price, cost + markup → price
- Break-Even Calculator — break-even units / revenue / contribution margin / margin of safety
- Quotation Generator — form + sticky preview, line items, tax, discount, validity, print / PDF
- Salary Slip Generator — earnings + deductions, net pay, print / PDF

**Shared**

- `ColorPicker` (`components/ui/color-picker.tsx`) — Popover + `react-colorful` + hex input
- `OutputPanel`: props `onDownload` / `downloadLabel`

**Dependencies**

- `react-colorful`, `terser`, `marked`, `isomorphic-dompurify`, `@tailwindcss/typography`

### Changed

- `ToolLayout` wide (`max-w-6xl`) for invoice / quotation / salary-slip
- `DatePicker` оборачивает `PopoverTrigger` в `<div style={{display: 'contents'}}>` — фикс Base UI focus-guards
- `SegmentedControl` → `inline-flex flex-wrap`, опции переносятся на мобиле
- `ColorPickerView` использует `react-colorful` вместо нативного `<input type="color">`
- `MetaTagGeneratorView` — `flex flex-col lg:flex-row` с `min-w-0 flex-1`
- `CopyButton`, `reset` / `clear` / `download` — берём из `global`, не дублируем в `config.<tool>`

### Fixed

- Base UI focus-guards ломали layout внутри `space-y-*` / flex / grid
- Print CSS через `[id$='-preview']` — не хардкодим каждый id
- ICU `INVALID_KEY` в `license-generator.hints` — точки в ключах
- ICU `UNCLOSED_TAG` в `code-minifier` FAQ — `<` и `>` в строках
- `DOMPurify.sanitize is not a function` — переход на `isomorphic-dompurify`
- Задержка при drag нативного `<input type="color">` — заменён на `react-colorful`
- Мобильный overflow в табах `meta-tag-generator` — `SegmentedControl` переносится
- `InvoiceGeneratorView` полностью локализован, удалён мёртвый `InvoicePreview.tsx`

## [0.3.0] - 2026-09-28

### Added

**Developer tools (9)**

Unit Converter, JSON Formatter, Base64 Encoder / Decoder, UUID Generator (v4 + v7), Hash Generator (MD5 / SHA-1 / SHA-256 / SHA-512), URL Encoder / Decoder, Timestamp Converter, JWT Decoder, JWT Encoder.

**Text tools (4)**

Word Counter, Case Converter, Lorem Ipsum Generator, Diff Checker.

**Generator tools (3)**

Password Generator, QR Code & Barcode Generator, Image Compressor.

**Calculators — finance (10)**

Percentage, EMI, Compound Interest, Discount, Tip, GST, Salary, ROI, SIP, Date Difference.

**Calculators — health (8 new, 11 total)**

TDEE & Macro, Body Fat, Ideal Weight, Water Intake, Heart Rate Zones, Pregnancy Due Date, Sleep Cycle, VO2 Max Estimator.

**Tool system**

- `ToolConfig` union with 17 kinds
- `data/tools/`, `data/registry.ts`
- `ToolLayout`, `ToolView` (с `assertNever`), `ToolSchema`
- Shared: `InputPanel`, `OutputPanel`, `CopyButton`, `SegmentedControl`, `SliderField`, `DatePicker`, `FAQ`, `RelatedTools`

**SEO**

- JSON-LD `WebApplication` + `FAQPage` на всех страницах
- `sitemap.ts` — все страницы, обе локали

### Changed

- `[slug]/page.tsx` — тонкий диспетчер через registry
- Home, Search, CategoryPage — используют `getAllRegistryEntries()`
- Namespace `calculator` → `global`

### Fixed

- Self-import cycle в `data/calculators/index.ts`
- ICU `MALFORMED_ARGUMENT` в `json-formatter.inputPlaceholder`
- Все `[locale]`-страницы теперь SSG

## [0.2.0] - 2026-09-27

### Added

- Tool system: `ToolConfig` union, `data/tools/`, `registry`, `ToolLayout`, `ToolView`, `ToolSchema`
- Developer tools: Unit Converter, JSON Formatter, Base64 Encoder / Decoder
- Shared: `FAQ` (бывший `CalculatorFAQ`), `RelatedTools` (cross-type)
- Navigation: `SearchTrigger` (`full` / `icon`), поиск в сайдбаре, мобильный хедер, tooltip в `SidebarSettings`
- i18n: `setRequestLocale` → `next/root-params`, `generateStaticParams` в layout — полный SSG

### Changed

- `[slug]/page.tsx` — диспетчер через registry
- Namespace `calculator` → `global`

### Fixed

- Self-import cycle в `data/calculators/index.ts`
- ICU `MALFORMED_ARGUMENT` в `json-formatter.inputPlaceholder`

## [0.1.0] - 2026-09-27

Первый рабочий MVP: архитектура, роутинг, i18n, дизайн-система, 3 калькулятора. Сайт собирается и работает на двух языках.

### Added

**Architecture**

Next.js 16.3.6 (App Router, Turbopack) + React 19.2.8 + TypeScript 5 + Tailwind CSS 4, Biome, Husky, pnpm, next-intl v4 (`en`, `ru`, `localePrefix: 'as-needed'`), `proxy.ts`, `getBaseUrl()`.

**Routing**

Flat URLs `/[locale]/[slug]`, 6 SEO-хабов, service pages, SSG через `generateStaticParams`.

**Design system**

shadcn/ui на Base UI, light / dark / system через `next-themes`, Inter + Geist Mono, Lucide, CSS-токены.

**Navigation**

Collapsible sidebar (`collapsible="icon"`), активные ссылки, поиск-модалка с `⌘K`, settings popover, locale switcher.

**Home, Pages**

Hero, Stats, ToolGrid, категории-хабы, About, Privacy, 404.

**Content**

BMI, Calorie, Age (все в `health`).

**SEO**

Metadata, canonical, hreflang, `sitemap.ts`, `robots.ts`, JSON-LD `WebApplication`, OG / Twitter.

**Types & data**

`CategorySlug`, `CalculatorConfig`, `InputField`, `ResultRange`, `FAQItem`, `Values`, `OperationResult`, `data/calculators/*`.

**Translations**

`en.json` + `ru.json`: `meta`, `home`, `nav`, `sidebar`, `category`, `global`, `notFound`, `about`, `privacy`, `config`.

### Fixed

- `Functions cannot be passed to Client Components` — форма получает `slug`
- ICU `UNCLOSED_TAG` — убраны угловые скобки из placeholder
- Times New Roman fallback — `--font-sans: var(--font-inter)`
- `'use client'` в двойных кавычках → одинарные
- Отсутствующий `import '../globals.css'`
- Удалён barrel `@/components` (цикл ломал `SidebarProvider`)
- Windows EPERM — `rm -rf .next`

### Known limitations

- Только `health` заполнена, остальные 5 хаба пустые
- `<ProjectName>` не заменён
- AdSense, GA, OG-картинка не подключены