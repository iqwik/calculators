# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### TODO

- `SalarySlipGeneratorView`: replace `payPeriod` text input with two `<Select>` (Month + Year), localize, add `payMonth` / `payYear` to state
- Currency formatting: RUB after number, `toLocaleString(locale, ...)` for numbers
- Extract `CurrencySelect` — `CURRENCIES` / `CURRENCY_SYMBOLS` duplicated across 3 files
- `ToolSchema`: remove `<ProjectName>` from `publisher.name`
- `types/common.ts`: extract `FAQItem` (duplicated)
- Audit `placeholder` / `defaultValue` for hardcoded English
- Check remaining Base UI components (`Select`, `DropdownMenu`, `Tooltip`, `SidebarSettings`) for focus-guards
- Remove `display: contents` wrapper after `@base-ui/react` update (PR #4350)
- `CURRENT_YEAR` — wrap in `useMemo` inside the component
- `CalculatorForm`: switch `<input type="date">` to `DatePicker` for `age-calculator`
- Active category link in sidebar — slug → category (currently `===`)
- Sidebar state resets on locale switch
- Mobile sidebar (Sheet) not tested
- `meta-tag-generator`: preview titles (`"Google search preview"`, etc.) hardcoded in EN
- OG image (`og-default.jpg`), AdSense, GA
- **Locale refactor in `data/**`:** all hardcoded `'en-US'` / `'en-IN'` (and any hardcoded locale in `toLocaleString` / `toLocaleDateString` / `Intl.*`) — replace with `ctx.locale` passed from `calculate`. Run `grep -rn "toLocaleString('en\|toLocaleDateString('en\|Intl\." data/`. Affects `finance.ts` (`formatInt`, `formatAmount`, `formatINR`), `pregnancy-due-date-calculator`, potentially `health.ts`. After refactor — delete global `formatInt` / `formatAmount`, keep only local `fmt` inside each `calculate` (see CONTEXT.md, rules 29–30).
- `tax-regime-comparator` — deferred. Decision A (keep as the only India-specific tool, add "(India)" to title) or B (make universal → `income-tax-calculator`, remove slabs and 80C / 87A)

## [0.5.0] - 2026-09-29

### Added

**Finance calculators (5 new)**

- Savings Goal Calculator — how much to save monthly toward a goal, with initial deposit, expected return and timeframe
- Loan Eligibility Calculator — maximum loan amount based on DTI (income − existing debt) / max DTI %
- Rent vs Buy Calculator — compare renting and buying over N years: equity vs investment portfolio, home appreciation, rent growth, investment return
- Fixed Deposit Calculator — maturity value and interest earned with any compounding frequency
- Number to Words Converter — numbers spelled out (30+ languages via `n2words`), shows EN + current UI locale

**Health calculators (4 new)**

- Sleep Debt Calculator — accumulated sleep debt over a period, severity (none / mild / moderate / severe), nights to recover
- Menstrual Cycle Calculator — next period, ovulation, fertile window, next 3 cycles, current cycle day
- Calorie Deficit Planner — daily calorie target for weight loss (BMR → TDEE → deficit), pace (healthy / too slow / too fast)
- Pregnancy Week Tracker — current pregnancy week, trimester, progress, days until due date

**Developer tools (5 new)**

- SVG to Base64 Converter — Base64 / URL-encoded Data URI, ready-to-use snippets for CSS / HTML / `<img>`
- Base64 to Image Decoder — paste Base64 → preview + download, auto-detects format (PNG / JPEG / GIF / WebP / BMP / SVG / ICO / AVIF)
- Regex Tester — live highlighting, 6 flags (g i m s u y), groups, MAX_MATCHES 10,000, zero-length match protection
- Regex Generator — pattern generation from positive / negative examples, explanation, validation
- CSS Shadow & Gradient Generator — shadows + linear / radial / conic gradients, live preview, CSS copy

**Business tools (1 rename)**

- `salary-slip-generator` → `payslip-generator`. Universal version without HRA / PF / TDS in defaults. User names their own earnings and deductions. `kind` in `ToolConfig` renamed accordingly.

**Renamed (universalization)**

- `emi-calculator` → `loan-payment-calculator`
- `gst-calculator` → `sales-tax-calculator` (CGST / SGST / IGST → universal add / remove tax, rates 5 / 10 / 15 / 20 / 25 %)
- `sip-calculator` → `monthly-investment-calculator`
- `salary-slip-generator` → `payslip-generator`

**Locale-aware calculate**

- `CalcContext { locale: string }` — new type in `types/calculator.ts`
- `CalculatorForm` passes `{locale}` as a second argument to `calculate`
- `calculate(values, {locale})` — destructuring only when needed, optional
- Number / date formatting via local `fmt` inside `calculate`, closed over the locale
- `toLocaleDateString(locale, {...})` — short BCP-47 tag (`'en'`, `'ru'`) is valid, no mapping needed

**ICU params**

- `Option` and `OperationResult` now support `params: Record<string, string | number>`
- `CalculatorForm` passes `params` to `tConfig(value, params)` for both main `value` and `secondary`
- ICU plural / interpolation: `"text": "{count} nights"` → `11 nights`

**Dependencies**

- `n2words@6.2.0` — number spelling, 30+ languages, subpath import `n2words/en-US`, `n2words/ru`, API `toCardinal` (not `toWords`)

**Shared components**

- `InputPanel`, `OutputPanel` — reused across all new views (regex, css, number-to-words)

### Changed

- `types/calculator.ts`: `CalculatorConfig.calculate` signature is now `(values, ctx?) => OperationResult`
- `CalculatorForm`: `useLocale()` → pass `{locale}` to `calculate`, `useEffect` and `handleSubmit`
- `data/tools/index.ts`: `isWideTool` — added `svg-to-base64`, `base64-to-image`, `css-generator`, `number-to-words`
- `types/common.ts`: `Option.params` and `OperationResult.params`
- `messages/en.json` / `messages/ru.json`: sections for 15 new tools, full localization of renamed ones
- Biome rule `noAssignInExpressions`: `while ((m = regex.exec(text)))` → `for (;;) { const m = ...; if (m === null) break }`
- `secondary[].value` pattern: either a pure translation key or a ready string. Concatenation of "number + key" is forbidden

### Fixed

- ICU `MALFORMED_ARGUMENT` in `meta-tag-generator.titleRecommended` / `descriptionRecommended` — curly braces removed from text
- ICU `UNCLOSED_TAG` with inline placeholder `{'{'}` — replaced with textual descriptions
- `n2words` import: v6 requires subpath (`n2words/en-US`), not root, and `toCardinal`, not `toWords`
- `target` in `tsconfig.json` raised to ES2020 — RegExp dotAll flag `s`
- `savings-goal-calculator`: edge case `remaining <= 0` (initial deposit exceeds goal)
- `rent-vs-buy-calculator`: parallel loop for Buy / Rent — correct accounting of the delta between mortgage + costs and rent
- `number-to-words-converter`: hardcoded `h` in `value` → moved to `resultUnit` / `label`
- `sleep-debt-calculator`: `recoveryNone` / `recoveryText` — non-existent keys; removed, concatenation `"5 sleep-debt-calculator.units.nights"` removed
- `menstrual-cycle-calculator`: slug `period-calculator` → `menstrual-cycle-calculator`, title / h1 / description explicitly mention "menstrual cycle"
- `sales-tax-calculator`: `calculate` used old keys `gst` / `cgst` / `sgst` — replaced with `tax` / `rate` / `gross`
- `tax-regime-comparator`: `related` pointed to non-existent `hra-exemption-calculator` / `epf-gratuity-calculator` — replaced with `loan-payment-calculator` / `monthly-investment-calculator`
- `payslip-generator`: `useTranslations('config.salary-slip-generator')` → `'config.payslip-generator'`, `kind` renamed

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
- Invoice Number Generator — prefix + starting number, "Next available" tracker, client / notes, table
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
- `DatePicker` wraps `PopoverTrigger` in `<div style={{display: 'contents'}}>` — Base UI focus-guards fix
- `SegmentedControl` → `inline-flex flex-wrap`, options wrap on mobile
- `ColorPickerView` uses `react-colorful` instead of native `<input type="color">`
- `MetaTagGeneratorView` — `flex flex-col lg:flex-row` with `min-w-0 flex-1`
- `CopyButton`, `reset` / `clear` / `download` — pulled from `global`, not duplicated in `config.<tool>`

### Fixed

- Base UI focus-guards broke layout inside `space-y-*` / flex / grid
- Print CSS via `[id$='-preview']` — no hardcoding of each id
- ICU `INVALID_KEY` in `license-generator.hints` — dots in keys
- ICU `UNCLOSED_TAG` in `code-minifier` FAQ — `<` and `>` in strings
- `DOMPurify.sanitize is not a function` — switched to `isomorphic-dompurify`
- Native `<input type="color">` drag lag — replaced with `react-colorful`
- Mobile overflow in `meta-tag-generator` tabs — `SegmentedControl` wraps
- `InvoiceGeneratorView` fully localized, dead `InvoicePreview.tsx` removed

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
- `ToolLayout`, `ToolView` (with `assertNever`), `ToolSchema`
- Shared: `InputPanel`, `OutputPanel`, `CopyButton`, `SegmentedControl`, `SliderField`, `DatePicker`, `FAQ`, `RelatedTools`

**SEO**

- JSON-LD `WebApplication` + `FAQPage` on all pages
- `sitemap.ts` — all pages, both locales

### Changed

- `[slug]/page.tsx` — thin dispatcher via registry
- Home, Search, CategoryPage — use `getAllRegistryEntries()`
- Namespace `calculator` → `global`

### Fixed

- Self-import cycle in `data/calculators/index.ts`
- ICU `MALFORMED_ARGUMENT` in `json-formatter.inputPlaceholder`
- All `[locale]` pages are now SSG

## [0.2.0] - 2026-09-27

### Added

- Tool system: `ToolConfig` union, `data/tools/`, `registry`, `ToolLayout`, `ToolView`, `ToolSchema`
- Developer tools: Unit Converter, JSON Formatter, Base64 Encoder / Decoder
- Shared: `FAQ` (former `CalculatorFAQ`), `RelatedTools` (cross-type)
- Navigation: `SearchTrigger` (`full` / `icon`), search in sidebar, mobile header, tooltip in `SidebarSettings`
- i18n: `setRequestLocale` → `next/root-params`, `generateStaticParams` in layout — full SSG

### Changed

- `[slug]/page.tsx` — dispatcher via registry
- Namespace `calculator` → `global`

### Fixed

- Self-import cycle in `data/calculators/index.ts`
- ICU `MALFORMED_ARGUMENT` in `json-formatter.inputPlaceholder`

## [0.1.0] - 2026-09-27

First working MVP: architecture, routing, i18n, design system, 3 calculators. Site builds and runs in two languages.

### Added

**Architecture**

Next.js 16.3.6 (App Router, Turbopack) + React 19.2.8 + TypeScript 5 + Tailwind CSS 4, Biome, Husky, pnpm, next-intl v4 (`en`, `ru`, `localePrefix: 'as-needed'`), `proxy.ts`, `getBaseUrl()`.

**Routing**

Flat URLs `/[locale]/[slug]`, 6 SEO hubs, service pages, SSG via `generateStaticParams`.

**Design system**

shadcn/ui on Base UI, light / dark / system via `next-themes`, Inter + Geist Mono, Lucide, CSS tokens.

**Navigation**

Collapsible sidebar (`collapsible="icon"`), active links, search modal with `⌘K`, settings popover, locale switcher.

**Home, Pages**

Hero, Stats, ToolGrid, category hubs, About, Privacy, 404.

**Content**

BMI, Calorie, Age (all in `health`).

**SEO**

Metadata, canonical, hreflang, `sitemap.ts`, `robots.ts`, JSON-LD `WebApplication`, OG / Twitter.

**Types & data**

`CategorySlug`, `CalculatorConfig`, `InputField`, `ResultRange`, `FAQItem`, `Values`, `OperationResult`, `data/calculators/*`.

**Translations**

`en.json` + `ru.json`: `meta`, `home`, `nav`, `sidebar`, `category`, `global`, `notFound`, `about`, `privacy`, `config`.

### Fixed

- `Functions cannot be passed to Client Components` — form receives `slug`
- ICU `UNCLOSED_TAG` — angle brackets removed from placeholder
- Times New Roman fallback — `--font-sans: var(--font-inter)`
- `'use client'` in double quotes → single quotes
- Missing `import '../globals.css'`
- Removed barrel `@/components` (cycle broke `SidebarProvider`)
- Windows EPERM — `rm -rf .next`

### Known limitations

- Only `health` is populated, the other 5 hubs are empty
- `<ProjectName>` not replaced
- AdSense, GA, OG image not connected