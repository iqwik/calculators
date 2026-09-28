# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

**Business tools (7)**

- **Invoice Generator** (`/invoice-generator`) — form + sticky preview, line items, tax, discount, currency, logo upload, print / save as PDF, live preview, `localStorage` draft
- **Invoice Number Generator** (`/invoice-number-generator`) — prefix + starting number + leading zeros, «Next available» tracker, client / notes per entry, table of generated numbers, `localStorage` journal
- **UTM Link Builder** (`/utm-builder`) — 5 UTM parameters, live URL assembly, `encodeURIComponent` for values, copy result
- **Profit Margin & Markup Calculator** (`/profit-margin-calculator`) — three independent blocks: cost + price → margin/markup, cost + target margin → price, cost + markup → price
- **Break-Even Calculator** (`/break-even-calculator`) — fixed / variable / price → break-even units, break-even revenue, contribution margin, margin of safety
- **Quotation Generator** (`/quotation-generator`) — form + sticky preview, line items, tax, discount, subject, terms, validity date, print / save as PDF
- **Salary Slip Generator** (`/salary-slip-generator`) — earnings + deductions tables, net pay, print / save as PDF, `localStorage` draft

### Changed

- `ToolLayout` is now wide (`max-w-6xl`) for `invoice-generator`, `quotation-generator`, `salary-slip-generator` — form + preview two-column layout
- `DatePicker` wraps `PopoverTrigger` in `<div style={{display: 'contents'}}>` — fixes Base UI focus-guards shifting layout

### Fixed

- Base UI focus-guards breaking layout inside `space-y-*` / flex / grid — fixed via `display: contents` wrapper in `DatePicker`
- Print CSS now uses `[id$='-preview']` — picks up any preview container without hardcoding each id
- `InvoiceGeneratorView` fully localized (preview labels, fallbacks, placeholders)
- Dead `components/tool/InvoicePreview.tsx` removed

### TODO

- `SalarySlipGeneratorView`: `payPeriod` is a text input — replace with two `<Select>` (Month + Year), localized, `payMonth` + `payYear` in state
- `SalarySlipGeneratorView`: hardcoded `"January 2025"` placeholder and `toLocaleString('en-US')` in `freshSlip()`
- Currency formatting: RUB symbol should go after the number, use `toLocaleString(locale, ...)` for numbers
- Extract `CurrencySelect` — `CURRENCIES` + `CURRENCY_SYMBOLS` duplicated in 3 files
- `ToolSchema`: `<ProjectName>` hardcoded in `publisher.name`
- `types/common.ts`: extract `FAQItem` (currently duplicated in `calculator.ts` and `tool.ts`)
- Audit all `placeholder` / `defaultValue` for hardcoded English
- Check remaining Base UI components (`Select`, `DropdownMenu`, `Tooltip`, `SidebarSettings`) for focus-guards
- Remove `display: contents` wrapper once `@base-ui/react` ships PR #4350
- `CURRENT_YEAR` computed at module load — wrap in `useMemo` inside component
- DatePicker for `age-calculator` (`<input type="date">` still native in `CalculatorForm`)
- Active category link in sidebar — use slug → category resolution (currently strict `===`)
- Sidebar state resets on locale change (`[locale]` layout remounts — same root cause as theme flicker)
- Mobile sidebar (Sheet) not thoroughly tested
- OG image (`og-default.jpg`) not created
- AdSense and GA not connected (deferred to production)

## [0.3.0] - 2026-09-28

### Added

**Developer tools (9 total)**

- Unit Converter, JSON Formatter, Base64 Encoder / Decoder (from 0.2.0)
- UUID / GUID Generator — v4 + v7, bulk, uppercase, no-dashes
- Hash Generator — MD5, SHA-1, SHA-256, SHA-512
- URL Encoder / Decoder — Component / Full URL, swap, live
- Timestamp Converter — Unix, ISO 8601, local, batch, timezones
- JWT Decoder — header, payload, signature, expiry check
- JWT Encoder — HS256/HS384/HS512, live signing

**Text tools (4)**

- Word Counter — words, characters, sentences, paragraphs, reading / speaking time
- Case Converter — UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE
- Lorem Ipsum Generator — paragraphs / sentences / words, HTML tags option
- Diff Checker — split / unified view, line-level diff, added / removed stats

**Generator tools (3)**

- Password Generator — length, character sets, ambiguous exclusion, strength meter
- QR Code & Barcode Generator — QR (URL, text, email, phone, SMS, Wi-Fi, vCard) + 10 barcode formats, PNG / SVG download, colors, error correction
- Image Compressor — JPG / PNG / WebP, quality, resize, batch, no upload

**Calculator tools — finance (10)**

- Percentage, EMI, Compound Interest, Discount, Tip, GST, Salary, ROI, SIP, Date Difference

**Calculator tools — health (8 new, 11 total)**

- TDEE & Macro, Body Fat, Ideal Weight, Water Intake, Heart Rate Zones, Pregnancy Due Date, Sleep Cycle, VO2 Max Estimator (plus BMI, Calorie, Age from 0.1.0)

**Tool system**

- `ToolConfig` discriminated union with 17 kinds
- `data/tools/` — `developer.ts`, `text.ts`, `generators.ts`, `business.ts`, `unit-categories.ts`
- `data/registry.ts` — unified registry for calculators and tools
- `ToolLayout`, `ToolView` (switch by `kind` with `assertNever`), `ToolSchema` (JSON-LD)
- Per-tool view components in `components/tool/`

**Shared components**

- `InputPanel`, `OutputPanel`, `CopyButton`, `SegmentedControl`, `SliderField`, `DatePicker`
- `FAQ`, `RelatedTools` — cross-type resolution (calculators + tools)

**SEO**

- JSON-LD `WebApplication` + `FAQPage` on every tool and calculator page
- `sitemap.ts` — all pages, both locales

### Changed

- `[slug]/page.tsx` — thin dispatcher: resolves via registry, renders `CalcLayout` or `ToolLayout`
- `Stats`, `ToolGrid`, `SearchModal`, `CategoryPage` use `getAllRegistryEntries()` — tools show up on home, in search, in category hubs
- `messages/*/config` extended with per-tool translation sections
- Translation namespace `calculator` → `global` (calculate, reset, result, related, faq, backHome)

### Fixed

- `data/calculators/index.ts` self-import cycle
- ICU `MALFORMED_ARGUMENT` in `json-formatter.inputPlaceholder`
- All `[locale]` routes prerender statically (was `ƒ` → now `●`)

## [0.2.0] - 2026-09-27

### Added

**Tool system**

- `ToolConfig` union, `data/tools/`, `data/registry.ts`, `ToolLayout`, `ToolView`, `ToolSchema`

**Three developer tools**

- Unit Converter — 10 categories, live conversion, swap, all-units grid
- JSON Formatter — Beautify (2 / 4 spaces), Minify, live, error highlighting
- Base64 Encoder / Decoder — Encode / Decode, Standard / URL-Safe, swap, copy

**Shared components**

- `FAQ` (renamed from `CalculatorFAQ`), `RelatedTools` (cross-type)

**Navigation**

- `SearchTrigger` variants: `full` (sidebar) and `icon` (mobile)
- Search field moved to sidebar, `SidebarTrigger` moved to sidebar
- Mobile header with search modal
- `SidebarSettings` uses `SidebarMenuButton` with tooltip in collapsed mode

**i18n**

- `setRequestLocale` → `next/root-params` in `i18n/request.ts`
- `generateStaticParams` in `app/[locale]/layout.tsx` — full SSG

### Changed

- `[slug]/page.tsx` — thin dispatcher via registry
- `Stats`, `ToolGrid`, `SearchModal`, `CategoryPage` — use registry
- Translation namespace `calculator` → `global`

### Fixed

- `data/calculators/index.ts` self-import cycle
- ICU `MALFORMED_ARGUMENT` in `json-formatter.inputPlaceholder`
- All `[locale]` routes prerender statically

## [0.1.0] - 2026-09-27

First working MVP. Foundation laid: architecture, routing, i18n, design system, and three working calculators. The site builds, runs, and serves pages in two languages.

### Added

**Architecture**

- Next.js 16.3.6 (App Router, Turbopack) + React 19.2.8 + TypeScript 5 + Tailwind CSS 4
- pnpm, Biome 2.4.2, Husky
- next-intl v4.14.7 with `en` (default) and `ru`, `localePrefix: 'as-needed'`
- `proxy.ts` — next-intl middleware
- `getBaseUrl()` — single source of `BASE_URL`

**Routing**

- Flat URLs `/[locale]/[slug]` (e.g. `/ru/bmi-calculator`)
- 6 SEO category hubs: `/finance`, `/health`, `/text`, `/developer`, `/generators`, `/business`
- Service pages: home, About, Privacy, 404
- SSG via `generateStaticParams`

**Design system**

- shadcn/ui on Base UI (not Radix)
- Dark theme: light / dark / system via `next-themes`
- Inter (UI) + Geist Mono (code) via `next/font/google`
- Lucide React icons, `CategoryIcon` component
- CSS tokens: `--background`, `--foreground`, `--primary`, `--sidebar`, `--muted`, etc.

**Navigation**

- Collapsible sidebar (`collapsible="icon"`)
- Active link highlighting
- Search: sidebar field → modal, live filter, `⌘K` / `Ctrl+K`
- Settings popover: About, Privacy, Language, Theme
- Locale switcher: EN / RU

**Home page**

- Hero: badge, H1, subtitle, 6 pill categories
- Stats: dynamic count, `$0` / `0 ₽`, `100%`, `Fast`
- ToolGrid: search, filters, card grid, counter

**Pages**

- Category hub, calculator page, About, Privacy, 404

**Content: 3 working calculators**

- BMI, Calorie, Age (all in `health`)

**SEO**

- Metadata, canonical, hreflang
- `sitemap.ts`, `robots.ts`
- JSON-LD `WebApplication`
- OpenGraph / Twitter Card

**Types & data**

- `CategorySlug`, `CalculatorConfig`, `InputField`, `ResultRange`, `FAQItem`, `Values`, `OperationResult`
- `data/categories.ts`, `data/calculators/health.ts`, `data/calculators/finance.ts`
- Helpers: `getAllCalculators()`, `getCalculatorBySlug()`, `getCalculatorsByCategory()`, `getCategory()`

**Translations**

- `messages/en.json` + `messages/ru.json`
- Sections: `meta`, `home`, `nav`, `sidebar`, `category`, `global`, `notFound`, `about`, `privacy`, `config`

### Fixed

- `Functions cannot be passed to Client Components` — form receives `slug`
- ICU `UNCLOSED_TAG` — removed angle brackets from placeholders
- Times New Roman fallback — `--font-sans: var(--font-inter)`
- `'use client'` in double quotes → single quotes
- Missing `import '../globals.css'`
- `@/components` barrel removed (cycle broke `SidebarProvider`)
- `EPERM` on Windows — `rm -rf .next` workflow

### Known limitations

- Only `health` category has tools — other 5 hubs empty
- `<ProjectName>` placeholder not replaced
- AdSense and GA not connected
- OG image not created