# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

**Tool system (independent from calculators)**
- New `ToolConfig` discriminated union in `types/tool.ts` with three kinds: `unit-converter`, `json-formatter`, `base64`
- `types/common.ts` — shared `FAQItem` type, used by both calculators and tools
- `data/tools/` — new directory with `developer.ts` and `unit-categories.ts`
- `data/registry.ts` — unified registry: `getRegistryEntry(slug)`, `getAllRegistryEntries()`, `getRegistryEntriesByCategory(category)`
- `components/tool/ToolLayout.tsx` — server layout for tool pages
- `components/tool/ToolView.tsx` — switch by `kind`
- `components/tool/ToolSchema.tsx` — JSON-LD `WebApplication` + `FAQPage`

**Three developer tools**
- **Unit Converter** (`/unit-converter`) — 10 categories (length, weight, temperature, area, volume, speed, time, data, pressure, energy), live conversion, swap button, all-units grid
- **JSON Formatter** (`/json-formatter`) — Beautify (2 / 4 spaces), Minify, live formatting on input, inline error highlighting
- **Base64 Encoder / Decoder** (`/base64-encoder-decoder`) — Encode / Decode, Standard / URL-Safe alphabets, live conversion, swap, copy

**Shared components**
- `components/shared/FAQ.tsx` (was `CalculatorFAQ.tsx`) — used by calculators and tools
- `components/shared/RelatedTools.tsx` — resolves both calculators and tools by slug

**Navigation & UI**
- `SearchTrigger` now has two variants: `full` (sidebar, expanded) and `icon` (mobile header, collapsed sidebar)
- Search field moved into the sidebar (under the logo); `SidebarTrigger` also moved into the sidebar
- Mobile header (`lg:hidden`) with `SidebarTrigger` + search icon; modal opens on tap
- Sidebar settings button now uses `SidebarMenuButton` — icon-only when collapsed, tooltip with label

**i18n**
- `setRequestLocale` removed everywhere — migrated to `next/root-params` in `i18n/request.ts` (Next.js 16.3+)
- `generateStaticParams` added to `app/[locale]/layout.tsx` — full SSG for all locales

### Changed

- `CalculatorConfig` untouched; tools are now a fully separate system with own types and view
- `[slug]/page.tsx` is now a thin dispatcher: resolves via registry and renders either `CalcLayout` or `ToolLayout`
- `Stats`, `ToolGrid`, `SearchModal`, `CategoryPage` now use `getAllRegistryEntries()` / `getRegistryEntriesByCategory()` — tools show up on home, in search, in category hubs
- `messages/*/config` extended with `unit-converter`, `json-formatter`, `base64-encoder-decoder` sections
- Translation namespace `calculator` renamed to `global` (calculate, reset, result, related, faq, backHome) — shared across all features
- `SearchModal`: compact when query empty, fixed-height results block when typing, vertically centered empty state

### Fixed

- `data/calculators/index.ts` — self-import cycle (`'../calculators'` → `'./finance'` / `'./health'`)
- `getRelated()` removed from `data/calculators/index.ts` — superseded by `RelatedTools` (cross-type resolution)
- `MALFORMED_ARGUMENT` ICU error in `json-formatter.inputPlaceholder` — curly braces removed from placeholder string
- All `[locale]` routes now prerender statically (was `ƒ` dynamic → now `●` SSG)
- Removed `scripts/test-data.ts` — stale ad-hoc script referencing non-existent helpers

### TODO

- Active category link in sidebar — use slug → category resolution (currently strict `===`)
- Vertical position of category items in collapsed sidebar shifts upward (due to `SidebarGroupLabel` being hidden by shadcn)
- Tooltip on `SidebarTrigger` — Base UI tooltip requires `TooltipTrigger` wrapping, currently broken
- `<ProjectName>` hardcoded in `ToolSchema.publisher.name`
- `ToolView` — add `default` / `assertNever` for exhaustiveness
- Sidebar state resets on locale change (`[locale]` layout remounts — same root cause as theme flicker)
- `ThemeProvider` `<script>` warning in dev — suppressed via console filter (React 19 false positive)
- DatePicker for `age-calculator` (`<input type="date">` still native)
- `output: 'export'` breaks i18n (`localePrefix: 'as-needed'` incompatible, `proxy.ts` disabled) — keep default output, deploy to Vercel

## [0.1.0] - 2026-09-27

First working MVP. Foundation laid: architecture, routing, i18n, design system, and three working calculators. The site builds, runs, and serves pages in two languages.

### Added

**Architecture & infrastructure**
- Next.js 16.3.6 (App Router, Turbopack) + React 19.2.8 + TypeScript 5 + Tailwind CSS 4
- pnpm, Biome 2.4.2 (replaced ESLint/Prettier), Husky
- next-intl v4.14.7 with two locales: `en` (default) and `ru`, `localePrefix: 'as-needed'`
- `proxy.ts` — next-intl middleware
- `getBaseUrl()` helper — single source of `BASE_URL` for metadata, sitemap, robots, JSON-LD

**Routing**
- Flat URLs — `/[locale]/[slug]` (e.g. `/ru/bmi-calculator`)
- 6 SEO category hubs: `/finance`, `/health`, `/text`, `/developer`, `/generators`, `/business`
- Service pages: home, About, Privacy, 404
- SSG via `generateStaticParams` — all pages statically generated

**Design system**
- shadcn/ui on Base UI (not Radix)
- Dark theme: light / dark / system via `next-themes`
- Fonts: Inter (UI) + Geist Mono (code) via `next/font/google`, self-hosted
- Icons: Lucide React, category icons via `CategoryIcon` component
- CSS tokens: `--background`, `--foreground`, `--primary`, `--sidebar`, `--muted`, etc.

**Navigation & UI**
- Collapsible sidebar (`collapsible="icon"`): logo, search, categories, settings
- Active link highlighting
- Search: field in sidebar → opens modal, live filtering by name and description, `⌘K` / `Ctrl+K` shortcut
- Settings popover: About, Privacy, Language, Theme
- Locale switcher: EN / RU
- "Back to home" button on category pages

**Home page**
- Hero: badge, H1, subtitle, 6 pill categories
- Stats: dynamic tools count, `$0` / `0 ₽`, `100%`, `Fast`
- ToolGrid: search, 7 filters, card grid, counter

**Pages**
- Category hub: icon, title, counter, tools grid, "Back" button
- Calculator page: breadcrumbs, category badge, H1 + description, form (number / text / date / select), result (value, unit, range badge, secondary metrics), FAQ (accordion), related tools
- About: mission, offering, contact
- Privacy: privacy policy
- 404: with popular categories

**Content: 3 working calculators**
- BMI Calculator — with categories (underweight / normal / overweight / obese) and color indication
- Calorie Calculator — TDEE/BMR with gender and activity level; extra metrics for weight loss/gain
- Age Calculator — exact age in years / months / days + total days and weeks

**SEO**
- Metadata per page: title, description, canonical
- Alternates (hreflang) for `en` / `ru`
- `sitemap.ts` — all pages, both locales, priorities, `alternates.languages`
- `robots.ts` — `Allow: /` + sitemap reference
- JSON-LD `WebApplication` on calculator pages (with `inLanguage`)
- OpenGraph / Twitter Card meta tags

**Data**
- `data/categories.ts` — 6 categories (slug + icon)
- `data/calculators/health.ts` — 3 calculators
- `data/calculators/finance.ts` — placeholder
- `data/index.ts` — aggregator + helpers
- Helpers: `getAllCalculators()`, `getCalculatorBySlug()`, `getCalculatorsByCategory()`, `getCategory()`, `getRelated()`
- Types: `CategorySlug`, `CalculatorConfig`, `InputField`, `ResultRange`, `FAQItem`, `Values`, `CalculationOutput`

**Translations**
- `messages/en.json` and `messages/ru.json`
- Sections: `meta`, `home`, `nav`, `sidebar`, `category`, `calculator`, `notFound`, `about`, `privacy`
- `config` section — content for 3 calculators
- Unified ICU format (no `<ProjectName>` inside strings)

### Fixed
- `Functions cannot be passed to Client Components` — form receives `slug` instead of the whole object with `calculate` function
- `UNCLOSED_TAG (ICU)` — removed angle brackets from placeholders in translations
- Times New Roman font fallback — resolved `--font-sans: var(--font-sans)` self-reference in `globals.css`
- `'use client'` in double quotes — switched to single quotes for proper directive parsing
- Missing `import '../globals.css'` in layout — styles were not applied
- `@/components` barrel — removed, all imports are direct (resolved cycle that broke `SidebarProvider`)
- `node_modules/@types` — restored React types after installation failure
- `EPERM` (Windows) when renaming files in `.next/` — workflow updated to `rm -rf .next`

### Dependencies

**Production**
```
@base-ui/react           ^1.8.0
class-variance-authority ^0.7.1
cn                       ^0.4.0
lucide-react             ^1.48.0
next                     16.3.6
next-intl                ^4.14.7
next-themes              ^0.4.6
react                    19.2.8
react-dom                19.2.8
shadcn                   ^4.21.0
```

**Dev**
```
@biomejs/biome          2.4.2
@tailwindcss/postcss    ^4
@types/node             ^20
@types/react            ^19
@types/react-dom        ^19
husky                   ^9.1.7
lint-staged             ^17.6.0
tailwindcss             ^4
tsc-files               ^1.1.4
tw-animate-css          ^1.4.0
typescript              ^5
```

### Known limitations
- All calculators currently in `health` category — other 5 categories empty (only hubs)
- `<ProjectName>` placeholder not yet replaced in UI / metadata
- AdSense and GA not connected (deferred to production)
- `lint-staged` still references `eslint` — should be migrated to `biome`
- Mobile sidebar (Sheet) not thoroughly tested
- OG image (`og-default.jpg`) not created