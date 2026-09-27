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

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm start        # run production build
pnpm lint         # biome check
pnpm lint:fix     # biome check --write
pnpm format       # biome format --write
pnpm ts:check     # tsc --noEmit
```

### Environment

Create `.env.local`:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In production — set it to your real domain (used by `sitemap.ts`, `robots.ts`, canonical URLs, JSON-LD).

## Project structure

```
tools/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              ← root layout (html, body, ThemeProvider, Sidebar)
│   │   ├── page.tsx                ← home (Hero + Stats + ToolGrid)
│   │   ├── not-found.tsx           ← 404
│   │   ├── [slug]/
│   │   │   └── page.tsx            ← calculator page (form + result + FAQ + related + schema)
│   │   ├── about/page.tsx          ← About
│   │   ├── privacy/page.tsx        ← Privacy
│   │   ├── finance/page.tsx        ← SEO category hub
│   │   ├── health/page.tsx         ← SEO category hub
│   │   ├── text/page.tsx           ← SEO category hub
│   │   ├── developer/page.tsx      ← SEO category hub
│   │   ├── generators/page.tsx     ← SEO category hub
│   │   └── business/page.tsx       ← SEO category hub
│   ├── globals.css                 ← Tailwind + shadcn tokens + fonts
│   ├── robots.ts                   ← robots.txt
│   └── sitemap.ts                  ← sitemap.xml
│
├── components/
│   ├── calculator/
│   │   ├── CalculatorFAQ.tsx       ← FAQ block (details/summary)
│   │   ├── CalculatorForm.tsx      ← form + result (client)
│   │   ├── CalculatorSchema.tsx    ← JSON-LD WebApplication (server)
│   │   └── RelatedTools.tsx        ← related tools (client)
│   ├── category/
│   │   └── CategoryPage.tsx        ← shared category hub template (server)
│   ├── home/
│   │   ├── Hero.tsx                ← hero with badge + pill categories
│   │   ├── Stats.tsx               ← 4-block stats
│   │   └── ToolGrid.tsx            ← search + filters + grid (client)
│   ├── layout/
│   │   ├── AppSidebar.tsx          ← sidebar (client)
│   │   ├── LocaleSwitcher.tsx      ← language switcher
│   │   ├── SidebarSettings.tsx     ← settings popover
│   │   └── ThemeToggle.tsx         ← light/dark/system
│   ├── providers/
│   │   └── theme-provider.tsx      ← next-themes wrapper
│   ├── search/
│   │   ├── SearchModal.tsx         ← search modal (client)
│   │   └── SearchTrigger.tsx       ← ⌘K trigger (client)
│   └── ui/                         ← shadcn primitives (Base UI)
│       ├── CategoryIcon.tsx        ← slug → lucide icon
│       ├── badge.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── popover.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       └── tooltip.tsx
│
├── data/
│   ├── index.ts                    ← aggregator + helpers (getCalculatorBySlug, getRelated…)
│   ├── categories.ts               ← 6 categories (slug + icon)
│   └── calculators/
│       ├── index.ts                ← re-exports
│       ├── finance.ts              ← empty (placeholder)
│       └── health.ts               ← bmi, calorie, age
│
├── helpers/
│   ├── index.ts
│   └── getBaseUrl.ts               ← single source of BASE_URL
│
├── i18n/
│   ├── navigation.ts               ← Link, useRouter, usePathname
│   ├── request.ts                  ← getRequestConfig
│   └── routing.ts                  ← locales: ['en','ru']
│
├── messages/
│   ├── en.json                     ← EN translations
│   └── ru.json                     ← RU translations
│
├── types/
│   ├── index.ts
│   └── calculator.ts               ← CategorySlug, CalculatorConfig, InputField…
│
├── proxy.ts                        ← next-intl middleware
├── next.config.ts                  ← createNextIntlPlugin
├── tsconfig.json                   ← paths @/*
├── biome.json                      ← Biome (not ESLint)
├── postcss.config.mjs              ← @tailwindcss/postcss
├── package.json
└── .env.local                      ← NEXT_PUBLIC_SITE_URL
```

## Architecture

- **Data → Helpers → UI → Routing.** All math runs on the client; the server only ships HTML.
- **Routing:** flat URLs `/[locale]/[slug]`. Six SEO category hubs at `/[locale]/[category]`.
- **SSG:** every page is statically generated via `generateStaticParams`.
- **i18n:** `next-intl` v4 with `localePrefix: 'as-needed'` (EN without prefix, RU with `/ru`).
- **Data layer:** `data/calculators/*.ts` holds calculator configs (title keys, inputs, `calculate()` function). Text lives in `messages/*.json` under the `config` section.
- **Adding a calculator:** create the config in `data/calculators/<category>.ts`, add translation keys under `config.<slug>` in both `en.json` and `ru.json`. That's it.

## Notes

- **No `src/`.** Code lives in the project root.
- **Import alias:** `@/*` maps to root.
- **Named exports** in `components/`, default export only in `app/`.
- **Function declarations** preferred over `React.FC`.
- **No barrel imports** for `@/components`. Import directly: `@/components/ui/sidebar`, `@/components/layout/AppSidebar`.
- **shadcn/ui on Base UI** (not Radix). Use `render={<Component />}`, not `asChild`.

## License

Private. All rights reserved.