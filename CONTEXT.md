# Контекст проекта: сайт с калькуляторами

## Что это
Аналог calculator.net на Next.js + React 19 + TypeScript + Tailwind.
Цель — пассивный доход через Google AdSense.
Основной язык — **ENGLISH**, русский — вторичный (через локали в роутинге).

## Архитектура
- Данные (data/) → Логика (helpers/) → UI (components/) → Роутинг (app/)
- Динамический роут app/[locale]/[category]/[slug]/page.tsx
- SSG через generateStaticParams — каждая страница статический HTML
- Вся математика на клиенте, сервер отдаёт только HTML
- Мультиязычность: next-intl v4 + локали в URL

## Стек
- Next.js 16.3.6 (App Router, Turbopack)
- React 19.2.8
- TypeScript 5
- Tailwind CSS 4
- next-intl 4.14.7
- Biome 2.4.2 (не ESLint)
- pnpm
- Husky + lint-staged

## Соглашения
- Без src/, код в корне
- Import alias @/*
- Без React Compiler, мемоизация вручную
- Named exports в components/, default export только в app/ (требование Next.js)
- function declarations, не React.FC
- Типы в import type { ... }
- Кавычки одинарные, без точек с запятой, bracketSpacing: false

## Что сделано (i18n)

### Инфраструктура
- i18n/routing.ts — locales: ['en', 'ru'], defaultLocale: 'en', localePrefix: 'as-needed'
- i18n/request.ts — getRequestConfig, читает messages/{locale}.json
- i18n/navigation.ts — обёртки Link/useRouter/usePathname с авто-локалью
- proxy.ts — next-intl middleware (Next.js 16: файл называется proxy.ts, не middleware.ts)
- next.config.ts — обёрнут в createNextIntlPlugin

### Структура app/
Выбран путь А: **app/layout.tsx удалён**, `[locale]/layout.tsx` — единственный корневой layout.
- app/[locale]/layout.tsx — рендерит <html>, <body>, header, footer, NextIntlClientProvider
- app/[locale]/page.tsx — главная (чистый, без params.locale)
- app/[locale]/[category]/page.tsx — категория
- app/[locale]/[category]/[slug]/page.tsx — калькулятор
- app/[locale]/about/page.tsx — уже чистый
- app/[locale]/privacy/page.tsx — уже чистый
- app/[locale]/not-found.tsx — уже чистый

### Локализация контента
**Схема:** тексты живут в messages/, а в конфигах калькуляторов — только ключи.
- types/calculator.ts — **НЕ ТРОГАЕМ**. h1: string, title: string, description: string, faq: FAQItem[] — всё как есть. Ключи вместо текстов помещаются в эти же string-поля.
- data/calculators/health.ts — тексты заменены на ключи вида 'bmi-calculator.h1', 'bmi-calculator.inputs.height'
- data/calculators/datetime.ts — то же
- data/index.ts — **НЕ ТРОГАЕМ**, работает как был

**messages/en.json / ru.json содержат секции:**
- meta, nav, home, calculator, about, privacy, notFound
- config — контент калькуляторов: bmi-calculator, calorie-calculator, age-calculator

**В компонентах:**
- Серверные: getTranslations('config') / getTranslations('calculator')
- Клиентские: useTranslations('config') / useTranslations('calculator')
- Вызовы: t(config.h1), t(input.label), t(item.q)

### Компоненты (обновлены)
- CalculatorFormContent.tsx — t(input.label), t(input.hint), t(o.label), tUi('calculate')
- CalculatorResult.tsx — t(config.resultLabel), t(result.range.label), t(item.label)
- CalculatorFAQ.tsx — async, getTranslations('config') + getTranslations('calculator')
- RelatedTools.tsx — async, getTranslations('config') + getTranslations('calculator')
- CalculatorSchema.tsx — async, t(config.h1), t(config.description), t(item.q), t(item.a)
- CalculatorForm.tsx — без изменений
- components/layout/Breadcrumbs.tsx — Link из @/i18n/navigation
- components/ui/Input.tsx, Button.tsx — без изменений (презентационные)

## Что осталось сделать

### Ближайшее (шаг A4)
1. **app/[locale]/[category]/page.tsx**
   - Убрать `locale` из `interface PageProps` → `params: Promise<{category: string}>`
   - Убрать `locale` из деструктуризации: `const {category} = await params`

2. **app/[locale]/[category]/[slug]/page.tsx**
   - Убрать `locale` из `interface PageProps` → `params: Promise<{category: string; slug: string}>`
   - Убрать `locale` из деструктуризации: `const {category, slug} = await params`

3. Проверить `app/[locale]/layout.tsx` — использовать `next/root-params`:
   ```tsx
   import {locale as getRootLocale} from 'next/root-params'
   const locale = await getRootLocale()