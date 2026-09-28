# <ProjectName>

Free, fast, privacy-first online tools. Calculators, text utilities, generators, and developer tools that run 100% in your browser. No signup required.

Built with Next.js 16 + React 19 + TypeScript + Tailwind CSS 4. Monorepo-free, no `src/`.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.3.6 (App Router, Turbopack) |
| UI | React 19.2.8, Tailwind CSS 4, shadcn/ui on Base UI |
| Language | TypeScript 5 |
| i18n | next-intl 4.14.7 (`en`, `ru`) |
| Theming | next-themes (light / dark / system) |
| Icons | Lucide React |
| Fonts | Inter + Geist Mono (`next/font/google`) |
| Lint/Format | Biome 2.4.2 (not ESLint) |
| Package manager | pnpm |
| Git hooks | Husky + lint-staged |

## Getting Started

Run:

pnpm install
pnpm dev

Open http://localhost:3000.

### Scripts

pnpm dev          # start dev server
pnpm build        # production build
pnpm start        # run production build
pnpm lint         # biome check
pnpm lint:fix     # biome check --write
pnpm format       # biome format --write
pnpm ts:check     # tsc --noEmit

### Environment

Create `.env.local`:

NEXT_PUBLIC_SITE_URL=http://localhost:3000

In production — set it to your real domain (used by `sitemap.ts`, `robots.ts`, canonical URLs, JSON-LD).

## Project structure
```
.
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              ← root layout (html, body, ThemeProvider, Sidebar)
│   │   ├── page.tsx                ← home (Hero + Stats + ToolGrid)
│   │   ├── not-found.tsx           ← 404
│   │   ├── [slug]/page.tsx         ← dispatcher: calculator or tool
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── {finance,health,text,developer,generators,business}/page.tsx
│   ├── globals.css                 ← Tailwind + shadcn tokens + fonts + print CSS
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/
│   ├── calculator/
│   │   ├── CalcLayout.tsx          ← server layout for calculator pages
│   │   ├── CalculatorForm.tsx      ← form + result (client)
│   │   ├── CalculatorSchema.tsx    ← JSON-LD WebApplication (server)
│   │   └── SliderField.tsx         ← slider input
│   ├── tool/
│   │   ├── ToolLayout.tsx          ← server layout for tool pages (wide for invoice/quotation/salary-slip)
│   │   ├── ToolView.tsx            ← switch by kind + assertNever
│   │   ├── ToolSchema.tsx          ← JSON-LD WebApplication + FAQPage
│   │   └── *View.tsx               ← one view per tool kind
│   ├── shared/
│   │   ├── FAQ.tsx                 ← shared FAQ block
│   │   ├── RelatedTools.tsx        ← related tools (cross-type)
│   │   ├── InputPanel.tsx          ← textarea panel with header + copy
│   │   ├── OutputPanel.tsx         ← output panel with copy
│   │   └── CopyButton.tsx          ← copy-to-clipboard button
│   ├── category/
│   │   └── CategoryPage.tsx        ← shared category hub template (server)
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── Stats.tsx
│   │   └── ToolGrid.tsx
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── CategoryIcon.tsx
│   │   ├── LocaleSwitcher.tsx
│   │   ├── SidebarSettings.tsx
│   │   └── ThemeToggle.tsx
│   ├── providers/
│   │   └── theme-provider.tsx
│   ├── search/
│   │   ├── SearchModal.tsx
│   │   └── SearchTrigger.tsx
│   └── ui/                         ← shadcn primitives (Base UI)
│       ├── badge.tsx, button.tsx, calendar.tsx
│       ├── checkbox.tsx, command.tsx, date-picker.tsx
│       ├── dialog.tsx, dropdown-menu.tsx, input.tsx
│       ├── input-group.tsx, label.tsx, popover.tsx
│       ├── segmented-control.tsx, select.tsx, separator.tsx
│       ├── sheet.tsx, sidebar.tsx, skeleton.tsx
│       ├── slider.tsx, textarea.tsx
│       ├── toggle.tsx, toggle-group.tsx, tooltip.tsx
│
├── data/
│   ├── index.ts                    ← re-exports everything
│   ├── registry.ts                 ← unified registry (calculators + tools)
│   ├── categories.ts               ← 6 categories (slug + icon)
│   ├── calculators/
│   │   ├── index.ts
│   │   ├── finance.ts
│   │   └── health.ts
│   └── tools/
│       ├── index.ts
│       ├── developer.ts
│       ├── text.ts
│       ├── generators.ts
│       ├── business.ts
│       └── unit-categories.ts
│
├── helpers/
│   ├── index.ts                    ← assertNever + re-exports
│   └── getBaseUrl.ts               ← single source of BASE_URL
│
├── i18n/
│   ├── navigation.ts               ← Link, useRouter, usePathname
│   ├── request.ts                  ← getRequestConfig (next/root-params)
│   └── routing.ts                  ← locales: ['en','ru']
│
├── messages/
│   ├── en.json
│   └── ru.json
│
├── types/
│   ├── index.ts
│   ├── common.ts                   ← FAQItem, CategorySlug, Tag, BaseConfig, Values, Option, OperationResult, ResultRange, InputField
│   ├── calculator.ts               ← CalculatorConfig
│   └── tool.ts                     ← ToolConfig (discriminated union)
│
├── proxy.ts                        ← next-intl middleware
├── next.config.ts                  ← createNextIntlPlugin
├── tsconfig.json                   ← paths @/*
├── biome.json                      ← Biome (not ESLint)
├── postcss.config.mjs              ← @tailwindcss/postcss
└── package.json
```
## Architecture

- **Data → Helpers → UI → Routing.** All math runs on the client; the server only ships HTML.
- **Routing:** flat URLs `/[locale]/[slug]`. Six SEO category hubs at `/[locale]/[category]`.
- **SSG:** every page is statically generated via `generateStaticParams`.
- **i18n:** `next-intl` v4 with `localePrefix: 'as-needed'` (EN without prefix, RU with `/ru`).

### Two independent data systems

1. **Calculators** (`CalculatorConfig`) — classic «inputs → calculate → one result». Configs live in `data/calculators/<category>.ts`. `calculate()` is a function, so it cannot cross the server/client boundary — client components receive `slug: string` and resolve the config via `getCalculatorBySlug(slug)`.
2. **Tools** (`ToolConfig`, discriminated union by `kind`) — everything that doesn't fit «inputs → calculate» (formatters, converters, generators, form+preview builders). Configs live in `data/tools/<category>.ts`. Each `kind` has its own view component in `components/tool/`.

The **registry** (`data/registry.ts`) unifies both: `getRegistryEntry(slug)`, `getAllRegistryEntries()`, `getRegistryEntriesByCategory(category)`. The `[slug]/page.tsx` dispatcher resolves through the registry and renders `CalcLayout` or `ToolLayout`.

### SEO rule

Any tool that is tagged `business` in the source (thequickutils.com) is implemented as a `ToolConfig` — even if mechanically it looks like «inputs → calculate». This keeps it in the `/business` SEO hub.

## Adding a calculator

1. Create the config in `data/calculators/<category>.ts` (object `CalculatorConfig` in the array).
2. Add translation keys under `config.<slug>` in both `messages/en.json` and `messages/ru.json`: `title`, `h1`, `description`, `keywords`, `inputs.*`, `options.*`, `ranges.*`, `secondary.*`, `hints.*`, `resultLabel`, `resultUnit`, `faq.*`.

That's it — routing, sitemap, and the category hub pick it up automatically.

## Adding a tool

1. Add a new `kind` to the `ToolConfig` union in `types/tool.ts` (if it needs a new UI shape).
2. Create the config in `data/tools/<category>.ts`.
3. Create the view component in `components/tool/<Name>View.tsx` and add a branch to `ToolView.tsx`.
4. Add translation keys under `config.<slug>` in both `messages/*.json`.
5. If the tool is wide (form + preview), add its `kind` to `isWide` in `ToolLayout.tsx`.
6. If it uses print, make sure the preview container's `id` ends with `-preview` — the global print CSS uses `[id$='-preview']`.

That's it — routing, sitemap, hub, search, and home page pick it up automatically.

## Notes

- **No `src/`.** Code lives in the project root.
- **Import alias:** `@/*` maps to root.
- **Named exports** in `components/`, default export only in `app/`.
- **Function declarations** preferred over `React.FC`.
- **No barrel imports** for `@/components`. Import directly: `@/components/ui/sidebar`, `@/components/layout/AppSidebar`.
- **shadcn/ui on Base UI** (not Radix). Use `render={<Component />}`, not `asChild`.
- **`CopyButton`** for copy-to-clipboard — don't hand-roll. Pass only `getValue`, `disabled`, `className`, `showLabel`, `tooltipSide`, `onSuccess`.
- **Base UI focus-guards** break layout inside `space-y-*`. Wrap `PopoverTrigger` / `DropdownMenuTrigger` in `<div style={{display: 'contents'}}>` (see `date-picker.tsx`).
- **Formatting:** single quotes, no semicolons, `bracketSpacing: false` (Biome config).

## License

Private. All rights reserved.