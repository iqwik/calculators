# TODO

Project roadmap and backlog. Updated after every release.

Legend: `[x]` done · `[ ]` pending · `[~]` in progress · `[!]` blocked

---

## 🔥 Next up (v0.2.0)

### Content
- [~] Move existing calculators to their proper categories (currently all in `health`)
- [ ] Add calculators to `finance` (loan, compound interest, ROI, salary)
- [ ] Add calculators to `text` (word counter, case converter, diff checker)
- [~] Developer tools — 3 shipped: Unit Converter, JSON Formatter, Base64 Encoder/Decoder
- [ ] Add more developer tools (JWT decoder, UUID, regex tester, hash generator, URL encoder, timestamp converter, diff checker)
- [ ] Add calculators to `generators` (password, QR code, hash)
- [ ] Add calculators to `business` (invoice, quotation, profit margin)
- [ ] Extend `messages/*/config` for each new tool

### UX
- [ ] "Back" button on tool/calculator pages (`[slug]/page.tsx`) — same as on category hubs
- [ ] Active category link in sidebar — resolve slug → category (currently strict `===`)
- [ ] Fix vertical shift of category items in collapsed sidebar (`SidebarGroupLabel` is hidden by shadcn)
- [ ] Tooltip on `SidebarTrigger` — wrap in `TooltipTrigger` (currently broken)
- [ ] Sidebar state resets on locale change (`[locale]` layout remounts) — consider hoisting `SidebarProvider` to root layout
- [ ] Theme flickers on locale change — same root cause; consider hoisting `ThemeProvider` to root layout
- [ ] DatePicker for `age-calculator` instead of native `<input type="date">`
- [ ] `SearchModal` — replace placeholder text with translated string (ICU-safe, no curly braces)
- [ ] Loading states for `ToolGrid` and `SearchModal` (Suspense + skeleton)
- [ ] Verify 404 works under both locales
- [ ] Align breadcrumbs with the new theme

### Code quality
- [ ] `ToolView` — add `default` / `assertNever` for exhaustiveness
- [ ] `ToolSchema` — remove hardcoded `'ProjectName'` in `publisher.name`
- [ ] Extract shared `FAQItem` to `types/common.ts` (currently duplicated)
- [ ] Verify `RelatedTools` resolves tool slugs on live pages
- [ ] Remove leftover `console.error` override in `theme-provider.tsx` once next-themes fixes React 19 warning

### SEO
- [ ] Create OG image (`og-default.jpg`, 1200×630)
- [ ] Add `alternates.languages` for About / Privacy / category hubs
- [ ] JSON-LD `ItemList` for category hubs
- [ ] JSON-LD `FAQPage` on tool pages (already on calculator pages)

### Infrastructure
- [x] Run `pnpm build` — verify static generation for all pages (all `●` / `○`, no `ƒ`)
- [ ] Replace `eslint` with `biome` in `lint-staged` config
- [ ] Document `.env.local` in README
- [ ] Husky pre-commit → `biome check --write`

---

## 🚀 Production

- [ ] Deploy to Vercel
- [ ] Custom domain + HTTPS
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production URL
- [ ] Connect Google Analytics (`NEXT_PUBLIC_GA_ID`)
- [ ] Connect Google AdSense (`NEXT_PUBLIC_ADSENSE_CLIENT`)
- [ ] Submit AdSense for review (after content is ready)
- [ ] Generate `manifest.webmanifest` + favicon set
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Add `robots.txt` verification

---

## 🎨 Polish

- [ ] Replace `<ProjectName>` with the real project name (search & replace across the repo)
- [ ] Remove leftover barrel imports, if any
- [ ] Fix `useExhaustiveDependencies` warning in `sidebar.tsx` (Biome)
- [ ] Unify spacing and typography across pages
- [ ] Add hover / focus states audit
- [ ] Verify dark theme on every page
- [ ] Verify sidebar looks correct at all breakpoints

---

## 🧪 Testing

- [ ] Add Playwright (or Cypress) smoke tests
- [ ] Test calculator math (unit tests for `calculate()` functions)
- [ ] Test Unit Converter math (factor conversions, temperature special case)
- [ ] Test JSON Formatter (valid / invalid input, all three modes)
- [ ] Test Base64 (Standard vs URL-Safe, round-trip)
- [ ] Test i18n routing (EN ↔ RU switch preserves page)
- [ ] Test theme persistence (`localStorage`)
- [ ] Test sidebar state persistence
- [ ] Test `⌘K` search modal

---

## 💡 Ideas / backlog

- [ ] Favorites (pin tools to sidebar)
- [ ] Recently used tools
- [ ] Share button on tool pages (copy URL)
- [ ] Embed widget (`<iframe>` for calculators)
- [ ] Print-friendly styles for calculators
- [ ] Keyboard shortcuts reference page
- [ ] CSV / JSON export for calculators that produce tables
- [ ] Open Graph image per tool (dynamic via `next/og`)
- [ ] Changelog page in the app (`/changelog`)
- [ ] RSS feed for new tools
- [ ] Additional locales (e.g. `es`, `de`)
- [ ] `output: 'export'` build option for hosting without Node.js (requires `localePrefix: 'always'` and no middleware)

---

## ✅ Done

### v0.2.0 (unreleased) — 2026-09-28

- [x] Tool system — independent types (`ToolConfig`), data (`data/tools/`), registry (`data/registry.ts`)
- [x] `[slug]/page.tsx` dispatcher — resolves via registry, renders `CalcLayout` or `ToolLayout`
- [x] 3 developer tools shipped: Unit Converter, JSON Formatter, Base64 Encoder/Decoder
- [x] Shared components moved to `components/shared/` — `FAQ`, `RelatedTools`
- [x] `RelatedTools` resolves both calculators and tools by slug
- [x] `Stats`, `ToolGrid`, `SearchModal`, `CategoryPage` use `getAllRegistryEntries()`
- [x] `messages/*/config` extended with 3 tool configs (EN + RU)
- [x] Translation namespace `calculator` → `global` (shared strings)
- [x] `SearchTrigger` — two variants (`full` / `icon`)
- [x] Search + `SidebarTrigger` moved into the sidebar
- [x] Mobile header with sidebar trigger + search icon
- [x] `next/root-params` migration — `setRequestLocale` removed, `generateStaticParams` in `[locale]/layout.tsx`
- [x] `pnpm build` — all routes SSG (`●` / `○`)
- [x] `SearchModal` — compact on empty query, fixed-height results when typing, centered empty state
- [x] `theme-provider.tsx` — dev-only console filter for React 19 `<script>` warning

### v0.1.0 — 2026-09-27

- [x] Stack: Next.js 16 + React 19 + TS + Tailwind 4 + Biome
- [x] i18n: next-intl v4, locales `en` / `ru`, `localePrefix: 'as-needed'`
- [x] Flat routing: `/[locale]/[slug]` + 6 SEO hubs
- [x] 6 categories (`finance`, `health`, `text`, `developer`, `generators`, `business`)
- [x] `data/` — new structure with `health.ts` (bmi / calorie / age) and empty `finance.ts`
- [x] shadcn/ui on Base UI
- [x] Theme: `next-themes` + light / dark / system
- [x] Fonts: Inter + Geist Mono via `next/font/google`
- [x] Sidebar with search, categories, settings popover
- [x] Search modal (`SearchModal`) + `⌘K` trigger
- [x] Home: Hero + Stats + ToolGrid
- [x] Category pages (`CategoryPage`) + "Back" button
- [x] Calculator page: form, result, range badge, FAQ, related
- [x] `CalculatorForm` receives `slug` (fixes `Functions cannot be passed…`)
- [x] `messages/en.json` and `ru.json` — all sections + `config` for 3 calculators
- [x] About + Privacy + 404
- [x] SEO: metadata, canonical, `sitemap.ts`, `robots.ts`, JSON-LD `WebApplication`
- [x] Category icons via Lucide (`CategoryIcon`)