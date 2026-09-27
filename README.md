```
calculator/
│
├── app/                              # routing, pages, SEO
│   ├── layout.tsx                    # layout (Navbar, Footer)
│   ├── page.tsx                      # main — all categories
│   ├── globals.css                   # Tailwind + CSS-vars + body
│   ├── sitemap.ts                    # sitemap.xml
│   ├── robots.ts                     # robots.txt
│   ├── not-found.tsx                 # 404
│   │
│   ├── [category]/
│   │   ├── page.tsx                  # /health — calculators list
│   │   └── [slug]/
│   │       └── page.tsx              # /health/bmi-calculator
│   │
│   ├── about/
│   │   └── page.tsx
│   └── privacy/
│       └── page.tsx                  # required for AdSense
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Breadcrumbs.tsx
│   ├── calculator/
│   │   ├── CalculatorForm.tsx        # 'use client'
│   │   ├── CalculatorResult.tsx      # 'use client'
│   │   ├── CalculatorFAQ.tsx
│   │   ├── RelatedTools.tsx
│   │   └── CalculatorSchema.tsx      # JSON-LD
│   └── ui/
│       ├── Input.tsx
│       ├── Button.tsx
│       └── Card.tsx
│
├── utils/
│   ├── calculator-engine.ts          # validation + calculation
│   ├── formatters.ts                 # formating numbers/dates
│   └── seo.ts                        # JSON-LD
│
├── data/
│   ├── calculators/
│   │   ├── health.ts
│   │   ├── finance.ts
│   │   ├── math.ts
│   │   └── datetime.ts
│   ├── categories.ts
│   └── index.ts                      # list + helpers
│
├── types/
│   └── calculator.ts                 # all TypeScript-types
│
├── scripts/
│   └── validate-config.ts            # CI configs validation
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── AGENTS.md
├── biome.json
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

<!-- You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->
