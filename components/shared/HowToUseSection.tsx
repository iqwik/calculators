'use client'

import {useTranslations} from 'next-intl'

export interface HowToUseStep {
  title: string
  description: string
}

interface Props {
  slug: string
  titleKey?: string
  itemsKey?: string
  className?: string
}

export function HowToUseSection({
  slug,
  titleKey = 'howToUseTitle',
  itemsKey = 'howToUse',
  className,
}: Props) {
  const t = useTranslations('config')

  const fullTitleKey = `${slug}.${titleKey}`
  const fullItemsKey = `${slug}.${itemsKey}`

  if (!t.has(fullTitleKey) || !t.has(fullItemsKey)) return null

  const title = t(fullTitleKey)
  const items = t.raw(fullItemsKey) as HowToUseStep[]

  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <section className={className ?? 'mt-12'}>
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>
      <ol className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="font-semibold leading-snug">{item.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
