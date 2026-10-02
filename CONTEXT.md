# CONTEXT — ProjectName (online tools, AdSense-клон thequickutils.com)

## Что за проект

Сайт с онлайн-инструментами. За основу берём https://thequickutils.com/ — копируем структуру, категории, наполнение и UX, но пишем свой код и свои тексты (не копируем дословно, чтобы не получить duplicate content и проблем с AdSense). Цель — пассивный доход через Google AdSense. Основной язык — английский, вторичный — русский (через locale-роутинг). Название проекта пока ProjectName (placeholder).

Источник — 83 инструмента на главной. Разбиты на 6 категорий: finance, health, text, developer, generators, business. Плоские URL инструментов: /age-calculator, /bmi-calculator, /json-formatter. Всё считается на клиенте — «Runs 100% in your browser, no data leaves your device».

Курс проекта: полностью универсальный сайт. Никаких национальных привязок — ни в slug, ни в текстах, ни в формулах. Все инструменты работают в любой стране и с любой валютой. Единственное временное исключение — tax-regime-comparator (отложен на финальную стадию, см. техдолг).

## Стек

- Next.js 16.3.6 (App Router, Turbopack) + React 19.2.8
- TypeScript 5 (target ES2020)
- Tailwind CSS 4 (CSS-first, без tailwind.config.js)
- Biome 2.4.2 (не ESLint) + Husky + lint-staged
- pnpm
- next-intl v4.14.7, локали en (основная) и ru, localePrefix: as-needed
- shadcn/ui на Base UI v1.8.0 (не Radix). Тема light/dark/system через next-themes
- Иконки Lucide React. Шрифты Inter + Geist Mono через next/font/google
- react-day-picker (для Calendar в DatePicker)
- react-colorful — используется в ColorPickerView и ColorPicker-обёртке (components/ui/color-picker.tsx)
- terser — минификация JS в безопасном режиме (compress: false, mangle: false)
- marked + isomorphic-dompurify — Markdown-парсинг и sanitize
- @tailwindcss/typography — prose-стили для Markdown preview
- qrcode, jsbarcode, diff, spark-md5 — для отдельных инструментов
- n2words v6.2.0 — числа прописью. Экспорт — subpath: import {toCardinal} from 'n2words/en' (не 'n2words/en-US', не toWords, не из корня). Язык берётся из ctx.locale, реестр конвертеров — в NumberToWordsView.
- jszip — используется в favicon-generator и pdf-to-image
- pdfjs-dist v6.3.289 — используется в pdf-to-image. Subpath воркера: 'pdfjs-dist/build/pdf.worker.min.mjs'.
- ВАЖНО: pdf-lib и @pdf-lib/fontkit БЫЛИ УСТАНОВЛЕНЫ, но УДАЛЕНЫ. images-to-pdf работает через window.print() в iframe, не через pdf-lib.

## Архитектура

i18n: i18n/routing.ts, i18n/request.ts (использует next/root-params, НЕ setRequestLocale — он deprecated в Next.js 16.3+), i18n/navigation.ts, proxy.ts, next.config.ts (обёрнут в createNextIntlPlugin).

Роутинг: плоский — /[locale]/[slug] для инструментов и /[locale]/[category] для SEO-хабов. Никакой вложенности [category]/[slug].

SSG: generateStaticParams в app/[locale]/layout.tsx (для локалей) и в app/[locale]/[slug]/page.tsx (для slug'ов). Все страницы статические, кроме Proxy (middleware).

Лейаут: нет футера. Слева — collapsible sidebar (collapsible="icon"), справа — контент. В сайдбаре: лого + SidebarTrigger, SearchTrigger (полный), категории, SidebarSettings (popover: About, Privacy, Language, Theme). Поиск: псевдо-инпут → модалка, ⌘K / Ctrl+K. Мобильный хедер: SidebarTrigger + иконка поиска.

Три системы данных:

1. Calculators (CalculatorConfig): «inputs → calculate → один результат». Тип — types/calculator.ts. Данные — data/calculators/{finance,health}.ts. Роутинг — data/calculators/index.ts.

2. Tools (ToolConfig, discriminated union по kind): всё, что не вписывается в «inputs → calculate». Тип — types/tool.ts. Данные — data/tools/{developer,text,generators,business}.ts. Свой view-компонент на каждый kind.

3. Registry (data/registry.ts): объединяет обе системы. getRegistryEntry(slug), getAllRegistryEntries(), getRegistryEntriesByCategory(category). Реестр отдаёт {type: 'calculator' | 'tool', config}.

Роутинг [slug]: app/[locale]/[slug]/page.tsx — тонкий диспетчер. Резолвит через getRegistryEntry, рендерит либо CalcLayout config={calc}, либо ToolLayout config={tool}.

Layout'ы: components/calculator/CalcLayout.tsx и components/tool/ToolLayout.tsx. Оба принимают config, рендерят header + форму/view + FAQ + RelatedTools + Schema.

## Инфраструктура (hooks, helpers)

Папка hooks/:
- use-event.ts → useEvent — стабильная обёртка над useCallback, используется везде вместо useCallback для обработчиков с внешними зависимостями.
- use-smooth-progress.ts → useSmoothProgress — сглаживание прогресса. Используется в тулах с длительными операциями.
- use-mobile.ts (внутри sidebar.tsx) → useIsMobile — для SidebarProvider.

Папка helpers/:
- index.ts → assertNever (для discriminated union switch), getBaseUrl.
- getBaseUrl.ts → getBaseUrl() — единственный источник BASE_URL.
- utils/colors.ts — hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, relativeLuminance, contrastRatio.
- utils/base64-image.ts — blobToDataUri, bytesToBase64, parseBase64Image.
- utils/median-cut.ts — extractPalette для color-palette-extractor.

Папка types/:
- common.ts — FAQItem, CategorySlug, Tag, BaseConfig, Values, Option (с params), OperationResult (с params), ResultRange, InputField.
- calculator.ts — CalculatorConfig, CalcContext (locale).
- tool.ts — ToolKind union, ToolConfig union, все интерфейсы конфигов.
- index.ts — реэкспорт.

## Ключевые правила (зафиксировано)

1. Данные → хелперы → UI → роутинг. Вся математика на клиенте, сервер отдаёт только HTML.
2. Плоский роутинг. Никакой вложенности [category]/[slug].
3. CalculatorConfig содержит calculate — нельзя передавать из server в client. Client-компоненты получают slug: string и достают конфиг через getCalculatorBySlug(slug).
4. Tools — отдельная система. Свой тип (ToolConfig union), свои данные (data/tools/), свой view. Не смешивать с CalculatorConfig.
5. Реестр (data/registry.ts) — единственная точка входа для роутинга [slug]. Не ходить напрямую в data/calculators или data/tools из page.tsx.
6. Base UI, не Radix. Вместо asChild → render={<Component />}. Проп nativeButton={false} — только у Button и триггеров (DropdownMenuTrigger, PopoverTrigger, TooltipTrigger), не у SidebarMenuButton.
7. Никаких barrel-импортов из @/components. Только прямые пути: @/components/ui/sidebar, @/components/layout/AppSidebar.
8. getBaseUrl() из @/helpers — единственный источник BASE_URL.
9. ProjectName нельзя вставлять в JSON-строки переводов — ICU выбрасывает UNCLOSED_TAG. Использовать {name} или просто текст.
10. import '../globals.css' — первой строкой app/[locale]/layout.tsx. Без неё Tailwind не подключается.
11. Biome, не ESLint. Формат: одинарные кавычки, без точек с запятой, bracketSpacing: false.
12. Именованные экспорты в components/, default export только в app/. Функции — через function, не React.FC. Типы — через import type.
13. В ICU-строках фигурные скобки служебные. Для placeholder JSON использовать текст без скобок или экранировать одинарными кавычками.
14. setRequestLocale deprecated в Next.js 16.3+ — использовать next/root-params в i18n/request.ts.
15. generateStaticParams обязателен в app/[locale]/layout.tsx, иначе все страницы рендерятся динамически.
16. Инструменты, помеченные в источнике тегом business, делаем как ToolConfig (даже если по механике они «inputs → calculate»). Это важно для SEO — они должны попадать в хаб /business.
17. CopyButton — прокидываем только getValue, disabled, className, showLabel, tooltipSide, onSuccess, labelIdle, labelSuccess. labelIdle/labelSuccess — только когда нужен нестандартный текст. Не прокидывать CopyButton в OutputPanel — он уже там есть.
18. space-y-* нельзя использовать вокруг Base UI-компонентов с триггером (DatePicker, Select, DropdownMenu, Tooltip, ColorPicker). Focus-guards ломают layout. Обёртка div со style display: contents вокруг PopoverTrigger решает проблему.
19. Стандартные UI-строки берём из global, не дублируем в config.<tool>: calculate, reset, refresh, result, related, faq, backHome, clear, copy, copied, copyAll, copiedAll, download. В config.<tool> — только специфичное (title, h1, description, keywords, faq, inputs, options, ranges, secondary, hints, resultLabel, resultUnit, placeholder, downloadLabel только если формат важен).
20. В messages/*.json нельзя использовать угловые скобки в значениях. ICU парсит их как тег и бросает UNCLOSED_TAG. Заменять текстом: pre tags, HTML tags.
21. Нативный input type=color тормозит при drag на Windows/Chrome/Edge. Для выбора цвета использовать react-colorful или его обёртку ColorPicker в components/ui/color-picker.tsx.
22. Двухколоночные layout — на flex flex-col lg:flex-row с min-w-0 flex-1 на детях, не на grid lg:grid-cols-2.
23. SegmentedControl — inline-flex flex-wrap gap-0.5. На мобиле опции переносятся. При наличии icon label можно скрыть за hidden sm:inline.
24. Если у инструмента один Download — использовать onDownload проп OutputPanel, а не отдельную кнопку в toolbar. Если несколько — оставлять отдельные кнопки.
25. Все изображения с id превью должны заканчиваться на -preview — CSS [id$='-preview'] в @media print подхватит автоматически.
26. secondary[].value — либо чистый translation key, либо готовая строка (число, единица, процент). Склейка «число + ключ перевода» запрещена.
27. Option и OperationResult поддерживают params (в types/common.ts). Если value — translation key, params прокидываются в tConfig(value, params).
28. Сигнатура calculate: ctx?: CalcContext в типе — опциональный. Если калькулятору нужна локаль — деструктурируем {locale} прямо в аргументах: calculate: (values, {locale}) => ... CalculatorForm всегда передаёт {locale}.
29. Для форматирования чисел: определяем fmt внутри calculate, замыкаемся на локаль. Не создаём глобальные formatInt/formatAmount на уровне модуля.
30. Для форматирования дат: d.toLocaleDateString(locale, {year: 'numeric', month: 'short', day: 'numeric'}). locale — короткий BCP-47 ('en', 'ru') — валиден.

## Обязательные к использованию компоненты (shared + ui)

**components/shared/ — использовать везде, где применимо:**
- OutputPanel.tsx — { title, value, children, disableCopy, actions, heightClass, contentClassName, rawContent, onDownload, downloadLabel, disableDownload }. Для превью — rawContent + contentClassName="p-0" + children.
- CopyButton.tsx — { getValue, onSuccess, labelIdle, labelSuccess, showLabel, disabled, className, tooltipSide }. showLabel=false → icon-only с tooltip.
- InputPanel.tsx — { title, value, onChange, placeholder, icon, iconClassName, actions, heightClass, textareaClassName, mono, disabled, spellCheck, headerExtra }.
- ExpandableSplit.tsx — { title, left, right, normalHeight, showButton }.
- FullscreenPanel.tsx (FullscreenButton) — { title, children }.
- FAQ.tsx — { items }.
- RelatedTools.tsx — { slugs }.

**components/ui/ (shadcn на Base UI) — только через прямые импорты:**
badge, button, calendar, checkbox, color-picker, command, date-picker, dialog, dropdown-menu, input, input-group, label, popover, segmented-control, select, separator, sheet, sidebar, skeleton, slider, textarea, toggle, toggle-group, tooltip.

**hooks/ — везде, где есть асинхронные или долгие операции:**
- useEvent — вместо useCallback для всех обработчиков.
- useSmoothProgress — для прогресс-баров с рандомным/неравномерным шагом.
- useEffectEvent — можно, но с оговоркой: не класть в deps useEffect (в React 19.2.8 идентичность нестабильна → бесконечный цикл).

**helpers/ — обязательно:**
- getBaseUrl() — только импорт из @/helpers.
- assertNever — в switch по discriminated union.
- helpers/utils/colors.ts — для всех цветовых манипуляций.
- helpers/utils/base64-image.ts — для base64-изображений.
- helpers/utils/median-cut.ts — для color-palette-extractor.

## Известные грабли (уже решены, не наступать снова)

- --font-sans: var(--font-sans) — самоссылка → падение в Times New Roman. Должно быть --font-sans: var(--font-inter).
- 'use client' в двойных кавычках может не распознаваться на Windows → только одинарные.
- Barrel components/index.ts вызывает циклы → SidebarProvider становится undefined. Удалён.
- Windows EPERM при переименовании файлов в .next/ → rm -rf .next && pnpm dev.
- node_modules/@types может пропасть после сбоя установки → pnpm install.
- ICU MALFORMED_ARGUMENT: фигурные скобки в placeholder парсятся как аргумент. Убирать скобки из текста или экранировать.
- ICU INVALID_KEY: точки в ключах config.<tool>.<sub> парсятся как вложенность. Нельзя apache-2.0 — только apache2 или apache_20.
- ICU UNCLOSED_TAG: угловые скобки в значениях строк → парсятся как тег. Убирать.
- data/calculators/index.ts не должен импортировать '../calculators' (self-import cycle) — только './finance', './health'.
- Next.js 16 + React 19: next-themes рендерит script в клиентском компоненте → warning «Encountered a script tag». Подавлен через console.error фильтр в theme-provider.tsx (dev-only).
- output: 'export' несовместим с localePrefix: 'as-needed' и proxy.ts. Для проверки сборки использовать pnpm build && pnpm start.
- Base UI Popover / DropdownMenu / Select рендерит focus-guards вокруг триггера. Внутри родителя с space-y-* или flex/grid они получают неверный layout. Фикс: обернуть PopoverTrigger в div со style display: contents.
- DOMPurify.sanitize is not a function в Next.js App Router (SSR). Использовать isomorphic-dompurify.
- Print CSS использует [id$='-preview'] — подхватывает любой preview-контейнер (#invoice-preview, #quotation-preview, #salary-slip-preview, #markdown-preview).
- n2words v6 сменил API. Subpath: 'n2words/en', 'n2words/ru'. Функция toCardinal.
- Biome noAssignInExpressions — нельзя while ((m = regex.exec(text)) !== null). Писать через for (;;) { const m = regex.exec(text); if (m === null) break; ... }.
- TypeScript + CSS: objectFit: 'stretch' не входит в тип ObjectFit (csstype). Маппить: objectFit: fitMode === 'stretch' ? 'fill' : fitMode.
- pdfjs-dist v6: у PDFDocumentProxy НЕТ метода destroy(). Уничтожать через loadingTask.destroy(). Тип: ReturnType<typeof pdfjsLib.getDocument> | null.
- pdfjs-dist v6: page.render({canvas, canvasContext, viewport}) — canvas обязателен в v5+, в v4 был необязателен.
- pdfjs-dist v6 worker: GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString(). Turbopack собирает воркер отдельным чанком.
- print-color-adjust: exact нужен, чтобы браузер печатал фоны (Chrome по умолчанию их игнорирует).
- Chrome игнорирует @page { size: landscape } без указания конкретного размера. Только вместе: @page { size: A4 landscape }.
- Chrome НЕ умеет менять ориентацию листа через CSS, если @page без явного size. Пользователю всё равно нужно выбирать вручную в диалоге, либо печатать через iframe.
- window.print() в текущем окне конфликтует с ToolLayout (max-w-6xl, px-6, py-10) — A4 landscape не влезает, появляется 2-й лист. Решение: печать через изолированный iframe.
- body * { visibility: hidden } + [id$="-preview"] { visibility: visible } — работает для одиночных preview (invoice, payslip, quotation, markdown). Для многостраничных PDF не подходит — использовать iframe-печать.

## Правило: печать многостраничных PDF (images-to-pdf и подобное)

Для многостраничных PDF-подобных инструментов НЕ используем window.print() в текущем окне (конфликтует с ToolLayout, второй лист, фон не печатается). Вместо этого:

1. Собираем HTML-строку с чистым документом (никаких компонентов React — только строки).
2. В HTML: <style>@page { size: A4 landscape; margin: 0 }</style>, .page с width/height в mm, print-color-adjust: exact, страницы через page-break-after: always.
3. Создаём скрытый iframe, пишем в него doc.write(html), doc.close().
4. Ждём загрузки всех <img> (через img.complete или addEventListener('load')) — иначе печать пустая.
5. iframe.contentWindow.focus() → iframe.contentWindow.print().
6. setTimeout(() => iframe.remove(), 1500).
7. Экранирование caption и имён файлов — escapeHtml.

Классы .pdf-print-area и .pdf-page в globals.css НЕ НУЖНЫ — удалены. globals.css в @media print оставляет только [id$="-preview"]-механизм для одиночных preview.

## Правило: PreviewPage (автомасштаб превью)

Для preview многостраничного результата использовать компонент PreviewPage (внутренний, локальный для view):
- useRef на контейнер, ResizeObserver.
- scale = min(containerWidth / pageWpx, containerHeight / pageHpx).
- Внутри — внешний div с размерами pageWpx*scale × pageHpx*scale, внутри — pageWpx × pageHpx с transform: scale(scale), transformOrigin: 'top left'.
- Никогда не даёт горизонтального скролла.

## Правило: screenshot-beautifier (Canvas-наложение)

ScreenshotBeautifierView — редактор скриншотов. Всё через Canvas API, без библиотек.

**Структура:**
- Слева настройки (max-w-md): dropzone / файл, background mode (solid/gradient/transparent), padding, radius, frame (macOS-style), shadow, export (format/scale/quality).
- Справа preview в фиксированном контейнере (h-[560px]) через <canvas> с `max-h-full max-w-full object-contain`.

**Ключевые константы:**
- FRAME_BAR_HEIGHT = 32 — высота полоски macOS-рамки в CSS-пикселях (в Canvas логических px).
- FRAME_BG_LIGHT = '#e8eaed' — цвет рамки в свете. Тёмная = '#202124'.

**Хелперы в файле:**
- roundedRectPath(ctx, x, y, w, h, r) — рисует скруглённый путь через arcTo.
- makeLinearGradient(ctx, w, h, angleDeg, from, to) — линейный градиент через угол (0° = вправо, по часовой).
- extForFormat(fmt) — ext по mime.

**Пресеты градиентов** — 6 штук: sunset, ocean, purple, night, cream, teal. Каждый = { from, to }. Применение пресета перезаписывает gradientFrom / gradientTo.

**Логика рендера (useEffect на все настройки):**
1. Вычисляем outW = img.naturalWidth + padding*2, outH = img.naturalHeight + frameEnabled?32:0 + padding*2.
2. canvas.width/height = outW * exportScale, outH * exportScale. setTransform, scale(exportScale).
3. Фон — solid / gradient / прозрачный (transparent + JPEG/WebP → белый, с предупреждением в UI).
4. Рамка окна — roundedRectPath + clip, заливка frameBg, 3 точки macOS (кк/жк/зк) с dotRadius=6, dotGap=8, startX=winX+20.
5. Тень — если shadowEnabled, рисуем roundedRectPath с shadowColor rgba(0,0,0,opacity/100), shadowBlur, shadowOffsetY = blur/4, fill() без clip.
6. Картинка — drawImage(img, winX, imageY, winW, img.naturalHeight).

**download** — через canvas.toBlob(mime, quality/100). JPEG/WebP — quality слайдер, PNG — без потерь.

**Известные ограничения:**
- Огромные изображения (>4000px) при 2×/3× scale могут тормозить. В техдолг: отдельный уменьшенный preview-canvas.
- GIF → только первый кадр.

## Структура проекта

app/
├── [locale]/
│   ├── layout.tsx ← root layout (html, body, ThemeProvider, Sidebar, generateStaticParams)
│   ├── page.tsx ← главная
│   ├── not-found.tsx ← 404
│   ├── [slug]/page.tsx ← диспетчер calc/tool
│   ├── about/page.tsx
│   ├── privacy/page.tsx
│   └── {finance,health,text,developer,generators,business}/page.tsx
├── globals.css ← @import 'tailwindcss' + @media print для [id$='-preview']
├── robots.ts
└── sitemap.ts

components/
├── calculator/
│   ├── CalcLayout.tsx, CalculatorForm.tsx, CalculatorSchema.tsx, SliderField.tsx
├── tool/
│   ├── ToolLayout.tsx ← isWide для invoice/quotation/payslip/svg-to-base64/base64-to-image/css-generator/number-to-words/markdown-previewer/sql-formatter-minifier/code-minifier/meta-tag-generator/images-to-pdf/pdf-to-image/screenshot-beautifier
│   ├── ToolView.tsx ← switch по kind с assertNever
│   ├── ToolSchema.tsx
│   ├── UnitConverterView.tsx, JsonFormatterView.tsx, Base64View.tsx, WordCounterView.tsx, CaseConverterView.tsx, LoremIpsumView.tsx, DiffCheckerView.tsx, UuidGeneratorView.tsx, HashGeneratorView.tsx, UrlEncoderView.tsx, TimestampConverterView.tsx, JwtDecoderView.tsx, JwtEncoderView.tsx, PasswordGeneratorView.tsx, QrCodeGeneratorView.tsx, ImageCompressorView.tsx, ImageConverterView.tsx, BulkImageResizerView.tsx, ImageWatermarkView.tsx, ColorPaletteExtractorView.tsx, FaviconGeneratorView.tsx, Base64ImageOptimizerView.tsx, ImagesToPdfView.tsx (iframe print), ScreenshotBeautifierView.tsx (Canvas), InvoiceGeneratorView.tsx, InvoiceNumberGeneratorView.tsx, UtmBuilderView.tsx, ProfitMarginCalculatorView.tsx, BreakEvenCalculatorView.tsx, QuotationGeneratorView.tsx, SalarySlipGeneratorView.tsx (kind = 'payslip-generator'), MarkdownPreviewerView.tsx, SqlFormatterMinifierView.tsx, CodeMinifierView.tsx, ColorPickerView.tsx, ColorContrastCheckerView.tsx, MetaTagGeneratorView.tsx, GitignoreGeneratorView.tsx, SvgToBase64View.tsx, Base64ToImageView.tsx, RegexTesterView.tsx, RegexGeneratorView.tsx, CssGeneratorView.tsx, NumberToWordsView.tsx
├── shared/ (FAQ, RelatedTools, InputPanel, OutputPanel, CopyButton, ExpandableSplit)
├── category/CategoryPage.tsx
├── home/{Hero,Stats,ToolGrid}.tsx
├── layout/{AppSidebar,LocaleSwitcher,SidebarSettings,CategoryIcon,ThemeToggle}.tsx
├── providers/theme-provider.tsx
├── search/{SearchModal,SearchTrigger}.tsx
└── ui/ ← shadcn (Base UI)

data/
├── index.ts, registry.ts, categories.ts
├── calculators/{index,finance,health}.ts
└── tools/{index,developer,text,generators,business,license-templates,gitignore-templates,unit-categories}.ts

helpers/index.ts, getBaseUrl.ts, utils/{colors,base64-image,median-cut}.ts
hooks/use-event.ts, use-smooth-progress.ts
i18n/{navigation,request,routing}.ts
messages/{en,ru}.json
types/{index,common,calculator,tool}.ts

## Что уже сделано

### Инфраструктура
- Next.js 16.3 + React 19.2 + TS 5 + Tailwind 4 + Biome + pnpm, Husky + lint-staged
- i18n: next-intl v4, en + ru, localePrefix: 'as-needed'
- SSG для всех страниц, sitemap, robots
- SEO: метаданные, canonical, hreflang, JSON-LD WebApplication + FAQPage
- Дизайн-система на shadcn/Base UI, light/dark/system
- Сайдбар collapsible="icon", поиск с ⌘K, мобильный хедер
- Общие компоненты: FAQ, RelatedTools, InputPanel, OutputPanel, CopyButton, SegmentedControl, DatePicker, SliderField, ExpandableSplit, ColorPicker
- Print CSS через [id$='-preview'] для одиночных preview
- helpers/utils/colors.ts, helpers/utils/base64-image.ts, helpers/utils/median-cut.ts
- hooks/use-event.ts, hooks/use-smooth-progress.ts
- Locale-props в calculate — ctx?: CalcContext, CalculatorForm прокидывает {locale}

### Инструменты (75 из 83 + 1 замена)

**Calculators (30)**
- finance (15): percentage-calculator, loan-payment-calculator, compound-interest-calculator, discount-calculator, tip-calculator, sales-tax-calculator, salary-calculator, roi-calculator, monthly-investment-calculator, date-difference-calculator, tax-regime-comparator (отложен в техдолг), savings-goal-calculator, loan-eligibility-calculator, rent-vs-buy-calculator, fixed-deposit-calculator
- health (15): bmi-calculator, calorie-calculator, age-calculator, tdee-macro-calculator, body-fat-calculator, ideal-weight-calculator, water-intake-calculator, heart-rate-zones-calculator, pregnancy-due-date-calculator, sleep-cycle-calculator, vo2-max-estimator, sleep-debt-calculator, menstrual-cycle-calculator, calorie-deficit-planner, pregnancy-week-tracker

**Tools (45)**
- developer (26): unit-converter, json-formatter, base64-encoder-decoder, uuid-generator, hash-generator, url-encoder-decoder, timestamp-converter, jwt-decoder, jwt-encoder, markdown-previewer, sql-formatter-minifier, code-minifier, color-picker, color-contrast-checker, meta-tag-generator, gitignore-generator, license-generator, svg-to-base64, base64-to-image, regex-tester, regex-generator, css-generator, favicon-generator, base64-image-optimizer, pdf-to-image (в процессе). images-to-pdf временно в developer/generators по решению.
- text (5): word-counter, case-converter, lorem-ipsum-generator, diff-checker, number-to-words-converter
- generators (10): password-generator, qr-code-generator, image-compressor, image-converter, bulk-image-resizer, image-watermark, color-palette-extractor, favicon-generator, base64-image-optimizer, images-to-pdf, screenshot-beautifier
- business (7): invoice-generator, invoice-number-generator, utm-builder, profit-margin-calculator, break-even-calculator, quotation-generator, payslip-generator

### Волны
- Волна 1 (базовая, 21) — сделано
- Волна 2 (developer, 5) — сделано
- Волна 3 (finance, 6) — 5 сделано, tax-regime-comparator отложен
- Волна 4 (health, 4) — сделано
- Волна 5 (image, 10) — сделано 8: image-converter, color-palette-extractor, bulk-image-resizer, image-watermark, favicon-generator, base64-image-optimizer, images-to-pdf. Не сделано: mockup-generator → заменён на screenshot-beautifier (сделан), pdf-to-image (в процессе).
- Волна 6 (интерактивные трекеры) — не начата

## Удалено и почему

- **pdf-lib** и **@pdf-lib/fontkit** — были установлены для images-to-pdf, удалены. images-to-pdf работает через window.print() в iframe.
- **public/fonts/** (13 МБ Inter TTF) — удалена. Не нужны без pdf-lib + fontkit.
- **mockup-generator** — решено не делать. Источник сам сделал минимальную версию (2 девайса, 6 цветов), SEO-шанса против Canva/Placeit нет. Заменён на screenshot-beautifier.

## Технический долг

### Даты и локали
- pregnancy-due-date-calculator.calculate — toLocaleDateString('en-US', {...}) жёстко. Заменить на ctx.locale.

### Формат чисел
- finance.ts: formatInt, formatAmount, formatINR — 'en-US'/'en-IN'. Заменить на локальные fmt внутри calculate.
- grep -rn "toLocaleString('en-" data/ — найти все хардкоды.

### tax-regime-comparator
- Отложен. Решение: A (оставить, добавить "(India)" в title) или B (универсальный → income-tax-calculator).

### salary-slip-generator.payPeriod
- text-input. Нужно два Select (Month + Year), payMonth: number + payYear: number. Ключ localStorage → v2.

### images-to-pdf (мелкие доработки)
- Имя PDF — Chrome берёт из <title>.
- Quality slider не влияет на печать.
- Колонтитулы Chrome убираются только вручную в диалоге.

### screenshot-beautifier (мелкие доработки)
- Огромные изображения при 2×/3× scale могут тормозить — отдельный уменьшенный preview-canvas.

### Ревизия текстов и SEO
- Финальная стадия: EN+RU ревизия, добавить DE/ES/FR.

### ToolSchema
- Хардкод publisher.name: 'ProjectName' — параметризовать.

### CURRENT_YEAR
- В нескольких View вычисляется при импорте модуля — обернуть в useMemo.

### types/common.ts
- FAQItem дублируется.

### Bonus
- text-to-svg-generator (84-й) — обсудить после Волны 6.

## Что дальше

Осталось: pdf-to-image (в процессе), Волна 6, техдолг, финальный релиз 1.0.

### pdf-to-image (следующий)
- kind: 'pdf-to-image', category: 'developer', isWide: true, related: ['images-to-pdf', 'image-converter'].
- Библиотеки: pdfjs-dist (v6, воркер через new URL) + jszip.
- Только PDF. Word — в техдолг.
- Параметры: page range (парсер «1-5, 8, 11-13»), format PNG/JPEG/WebP, scale 1×/1.5×/2×/3×, quality (для JPEG/WebP), transparent background (только PNG).
- Результат: grid превью страниц, download по одной + ZIP.
- Прогресс: useSmoothProgress по страницам.
- PDF preview: PDFDocumentLoadingTask через pdfjsLib.getDocument, уничтожать task.destroy().

### Волна 6 — интерак