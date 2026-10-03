# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### TODO

- **`pdf-to-image`** — in progress. `pdfjs-dist@6.3.289` already installed. Plan: `kind: 'pdf-to-image'`, category `developer`, `isWide: true`, worker via `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`, page range parser (`1-5, 8, 11-13`), format PNG / JPEG / WebP, scale 1× / 1.5× / 2× / 3×, quality (JPEG / WebP), transparent background (PNG only), grid preview + ZIP download, `useSmoothProgress`. Destroy via `loadingTask.destroy()` (not `pdfDoc.destroy()`), `page.render({canvas, canvasContext, viewport})`.
- **Wave 6 — interactive trackers & builders**: `pomodoro-timer`, `habit-tracker`, `decision-maker`, `meeting-cost-calculator`, `trip-planner`, `bill-splitter`, `lead-tracker`, `resume-builder`, `visiting-card-generator`, `api-response-mock-generator`
- **Locale refactor in `data/**`:** all hardcoded `'en-US'` / `'en-IN'` (and any hardcoded locale in `toLocaleString` / `toLocaleDateString` / `Intl.*`) — replace with `ctx.locale` passed from `calculate`. Run `grep -rn "toLocaleString('en\|toLocaleDateString('en\|Intl\." data/`. Affects `finance.ts` (`formatInt`, `formatAmount`, `formatINR`), `pregnancy-due-date-calculator`, potentially `health.ts`. After refactor — delete global `formatInt` / `formatAmount`, keep only local `fmt` inside each `calculate` (see `CONTEXT.md`, rules 29–30).
- `SalarySlipGeneratorView`: replace `payPeriod` text input with two `<Select>` (Month + Year), localize, add `payMonth` / `payYear` to state
- Extract `CurrencySelect` — `CURRENCIES` / `CURRENCY_SYMBOLS` duplicated across 3 files
- `ToolSchema`: remove hardcoded `publisher.name`
- `types/common.ts`: extract `FAQItem` (duplicated)
- Audit `placeholder` / `defaultValue` for hardcoded English
- Remove `display: contents` wrapper after `@base-ui/react` update (PR #4350)
- `CURRENT_YEAR` — wrap in `useMemo` inside the component
- `CalculatorForm`: switch `<input type="date">` to `DatePicker` for `age-calculator`
- Active category link in sidebar — slug → category (currently `===`)
- Sidebar state resets on locale switch
- Mobile sidebar (Sheet) not tested
- `meta-tag-generator`: preview titles (`"Google search preview"`, etc.) hardcoded in EN
- OG image (`og-default.jpg`), AdSense, GA
- `images-to-pdf`: PDF filename comes from `<title>`; consider setting `document.title = 'images-YYYY-MM-DD.pdf'` inside the print iframe before printing
- `images-to-pdf`: image quality slider does not affect print output (browser prints originals). If needed — recompress via Canvas before printing
- Chrome page header / footer (date, URL, page numbers) can only be disabled by the user in the print dialog — cannot be removed programmatically
- Bonus tool: `text-to-svg-generator` (84th) — regex + shape / color / icon dictionary, offline, no dependencies. Discuss after Wave 6

## [0.7.0] - 2026-10-03

### Added

**Smart search (Fuse.js)**

- `hooks/use-search-index.ts` — `useSearchIndex()` builds a Fuse.js index from the current locale's `messages`. Searches across `h1`, `keywords`, `synonyms`, `description` with weights `0.5 / 0.3 / 0.15 / 0.05`. Options: `threshold: 0.35`, `ignoreLocation: true`, `minMatchCharLength: 2`, `includeScore: true`, `useTokenSearch: true`.
- `messages/en.json` / `messages/ru.json` — new `searchSynonyms` section: 3–6 curated synonyms per tool for all 75 tools (both locales). Covers abbreviations (`имт` / `bmi`, `ндс` / `vat`, `пдр`), colloquial phrases (`сколько мне лет`, `разделить счёт`, `снять или купить`, `сжать фото`), and transliterations.
- `SearchModal.tsx` — replaced naive `.includes()` filter with `fuse.search(query, {limit: 20})`. Results sorted by relevance score.
- `CONTEXT.md` — new rule #31: search lives on Fuse.js through `useSearchIndex`, no separate `search-data.ts`.

**Animated icons (@animateicons/react)**

- All Lucide icons replaced with `@animateicons/react@0.9.0` (Hugeicons + Lucide animated sets).
- New type exports in `types/common.ts`: `IconHandle` (`{startAnimation, stopAnimation}`), `IconProps` (`{size?, className?, color?, isAnimated?, duration?}`).
- Config type: `Icon: ComponentType<IconProps & RefAttributes<IconHandle>>` — allows `ref={iconRef}` and imperative `startAnimation()` / `stopAnimation()`.
- Icon imports use `as` aliases to preserve original names in configs (`import {PercentIcon as Percent} from '@animateicons/react/lucide/percent-icon'`).
- Direct per-file subpath imports (no barrel) — critical for Next.js App Router bundle size (71 kB per icon vs 918 kB for the whole set).
- `isAnimated={false}` disables built-in hover; parent handles mouse events via `onMouseEnter` / `onMouseLeave` and calls `ref.current?.startAnimation()`.
- `components/ui/search-icon.tsx` — dedicated animated search icon for `SearchTrigger`.
- `CONTEXT.md` — new rule #32: icons only from `@animateicons/react`, no direct `lucide-react`.

**Cookie consent**

- `components/cookie-consent.tsx` — fixed bottom banner (z-50), shadcn `Card` + `Button`, saves consent to `localStorage` under key `cookie-consent`. Renders only on first visit; never shows after `Accept`.
- `messages/*.json` — new `cookieConsent` namespace: title, description, privacyLink, accept.

**Theme tokens**

- `--success-custom` + `--success-custom-foreground` — mint-green (`#82F5C1` / `#00714E`), auto-inverts in `.dark`.
- `--secondary-hover` — used for neutral button hover: light `oklch(0.92 0.022 275)`, dark `oklch(0.19 0.02 275)`.
- `@utility bg-success-light` / `text-success-light` / `bg-success-dark` / `text-success-dark`.
- `@utility shadow-md-primary` — colored shadow tinted with `--primary`.
- `html { font-size: 14px }` — base font size; all `rem` units scale from 14 px.

**Custom scrollbar (DeepSeek style)**

- Thin scrollbar (8 px), transparent thumb by default, visible on container hover.
- `::-webkit-scrollbar-button` fully removed (no arrow buttons on Windows Chrome/Edge).
- `scrollbar-width: thin` + `scrollbar-color` for Firefox.
- `scrollbar-gutter: stable` on `html` — reserves space to prevent layout shift when scrollbar appears.

### Changed

- `tax-regime-comparator` → `income-tax-calculator`. Universal progressive tax calculator with user-defined brackets (base rate, higher threshold, higher rate, tax credit). No country-specific logic, no currency, no slabs. Old slug removed from `finance.ts` and all references.
- `finance.ts` — removed `calcOldRegimeTax`, `calcNewRegimeTax`, `formatINR` (no longer needed after universalization).
- `messages/*.json` — removed `config.tax-regime-comparator`, added `config.income-tax-calculator`.
- `SearchModal.tsx` — removed `getAllRegistryEntries` direct call, results no longer depend on `tConfig` inside `.filter()`.
- Sidebar `SidebarContent` — added `scrollbar-gutter-stable overflow-y-scroll` classes to prevent layout shift on scrollbar appearance.
- `CONTEXT.md` — updated with new rules (#31 search, #32 icons, #33 server/client config transfer) and known pitfalls (Biome LSP binary, Fuse token search version, `next/font` `--font-sans` self-reference).
- `CHANGELOG.md` — [Unreleased] TODO pruned of completed items; new [0.7.0] section.

### Fixed

- **Biome LSP won't start** (`Server process exited with code 0` in a loop). Cause: platform-specific binary `@biomejs/cli-win32-x64` not installed by pnpm (skipped optional dependencies). Fix: `pnpm add -O @biomejs/cli-win32-x64@<matching-version>`. Also: VS Code extension 3.7.1 requires CLI 3.x for full compatibility with 2.x — version mismatch causes immediate exit.
- `html { font-size: 14px }` ignored inside `@layer base` — moved outside layers, `shadcn/tailwind.css` was overriding it.
- Icon size hint in Tailwind (`size-5` shows `20px` but renders `17.5px` when base is 14 px) — documented, not a bug.
- `Icon: ComponentType<SVGProps<SVGSVGElement>>` — TypeScript error, `animateicons` icons accept `HTMLDivElement` props (wrapper `<div>` around `<svg>`). Fix: `ComponentType<IconProps & RefAttributes<IconHandle>>`.
- `useRef<typeof config.Icon>(null)` — wrong type. Should be `useRef<IconHandle>(null)`.
- `Functions cannot be passed directly to Client Components` — `config` contains `calculate` and `Icon`. Fix: client components receive `slug: string`, fetch config via `getRegistryEntry(slug)`.
- `CardPreview` — takes `slug: string` instead of `config` object.
- `CalculatorForm` / `SearchModal` — `useRef<IconHandle>` typed correctly.
- `html, body { overflow-x: clip }` + `scrollbar-gutter: stable` — prevents horizontal jump on modal open.
- `@custom-variant data-vertical` / `data-horizontal` — required for ScrollArea styling in Tailwind 4.

### Known limitations

- **Fuse.js without Web Worker**: for 75 tools the index builds in ~1–3 ms, no need for `FuseWorker`. Revisit at 500+ tools.
- **Search synonyms**: initial pass covers the top request patterns; iterate based on user feedback / analytics.
- **Biome LSP**: if VS Code extension and CLI major versions diverge (e.g. 3.x extension + 2.x CLI), the LSP crashes silently on every restart. Keep them in sync.

## [0.6.0] - 2026-09-29

### Added

**Generators tools (1 new)**

- **Images to PDF** (`images-to-pdf`) — combine JPG / PNG / WebP / GIF into a single PDF. Options: page size (A4 / Letter / Legal / A5), orientation (portrait / landscape), columns per page (1 / 2 / 3), margin (mm), gap (mm), fit mode (contain / cover / stretch), per-image rotation (↺ ↻), background color, page numbers, filename captions, quality slider. Vertical file list with reorder (↑ ↓) and remove. Live preview with auto-scaling (`PreviewPage` via `ResizeObserver`). Print via isolated iframe.

**Developer tools (1 new, in progress)**

- **PDF to Image** (`pdf-to-image`) — convert PDF pages to PNG / JPEG / WebP. Page-range parser (`1-5, 8, 11-13`), scale (1× / 1.5× / 2× / 3×), quality slider (JPEG / WebP), transparent background (PNG only). Grid of rendered pages, download individually or as ZIP. Uses `pdfjs-dist@6.3.289` with Turbopack worker (`new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`), `jszip` for the archive. Only PDF — Word (`.docx`) is out of scope (in tech debt).

**Print pattern for multi-page PDF**

- New print approach: build a clean HTML string, load it into a hidden `<iframe>`, wait for images, call `iframe.contentWindow.print()`. Solves: orientation (via `@page { size: <format> <orientation> }`), background printing (`print-color-adjust: exact`), and the extra blank page caused by `ToolLayout` (`max-w-6xl`, `px-6`, `py-10`).
- New preview pattern: `PreviewPage` — self-scaling via `ResizeObserver`, `scale = min(containerW / pageW, containerH / pageH)`, no horizontal scroll.

### Changed

- `types/tool.ts`: new kinds `'images-to-pdf'` and `'pdf-to-image'`; new config interfaces `ImagesToPdfConfig`, `PdfToImageConfig`.
- `data/tools/generators.ts`: added `images-to-pdf` config.
- `data/tools/developer.ts`: added `pdf-to-image` config (in progress).
- `data/tools/index.ts`: `isWideTool` — added `images-to-pdf`, `pdf-to-image`.
- `components/tool/ToolView.tsx`: new branches for `images-to-pdf`, `pdf-to-image`.
- `app/globals.css`: removed `.pdf-print-area` / `.pdf-page` rules (no longer used — replaced by iframe print). Kept only `[id$='-preview']` mechanism for single-page previews (invoice / payslip / quotation / markdown).
- `messages/en.json` / `messages/ru.json`: `config.images-to-pdf`, `config.pdf-to-image`.
- `pdfjs` usage: `loadingTask.destroy()` instead of `pdf.destroy()` (not present in v6); `page.render({ canvas, canvasContext, viewport })` (canvas required from v5+).

### Removed

- `pdf-lib` and `@pdf-lib/fontkit` — were installed for the original `images-to-pdf` implementation, which used `PDFDocument.create()` + embedded TTF. Replaced by the iframe-print approach, which produces an identical PDF via the browser's own print engine, with zero dependencies and no need for a custom font.
- `public/fonts/` (~13 MB, Inter TTF family) — no longer needed without `pdf-lib` + `fontkit`.

### Fixed

- Print orientation always fell back to portrait — Chrome ignores `@page { size: landscape }` without an explicit format. Fixed by `@page { size: A4 landscape }` inside the iframe's own `<style>`.
- Page background not printed — added `print-color-adjust: exact` (Chrome ignores backgrounds by default).
- Extra blank second page — caused by `ToolLayout`'s `max-w-6xl` / `px-6` / `py-10` and remaining siblings (`FAQ`, `RelatedTools`). Fixed by printing through an isolated iframe with no other DOM.
- `objectFit: 'stretch'` — TypeScript error, `FitMode` is not assignable to `ObjectFit`. Mapped to `'fill'`.
- `pdfjs-dist@6`: `PDFDocumentProxy.destroy` does not exist — switched to `loadingTask.destroy()`, typed via `ReturnType<typeof pdfjsLib.getDocument>`.
- `ImagesToPdfView`: removed `pdfSize` state (dead after switching to `OutputPanel` + `onDownload`); removed unused `formatBytes`, `stripExt`, `rotateSize`, `computeFit`, `FONT_REGULAR_URL`, `FONT_BOLD_URL`.
- Biome `useExhaustiveDependencies` loop — moved URL state reads into `pdfUrlRef` (auto-rebuild effect no longer depends on `pdfUrl`), `useEffectEvent` removed from `useEffect` deps (identity not stable in React 19.2.8 → infinite render loop).

### Known limitations

- `pdf-to-image` — Word (`.docx`) is not supported; conversion is PDF only.
- Chrome page headers / footers (date, URL, page number) cannot be suppressed programmatically — user must disable them in the print dialog. Same behaviour as the source.
- `images-to-pdf`: the quality slider does not affect printing (the browser prints originals). If actual size reduction is needed — pre-process through Canvas before print (in tech debt).

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

- `n2words@6.2.0` — number spelling, 30+ languages, subpath import `n2words/en`, `n2words/ru`, API `toCardinal` (not `toWords`)

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
- `n2words` import: v6 requires subpath (`n2words/en`), not root, and `toCardinal`, not `toWords`
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