'use client'

import {cn} from 'cn'
import {useTranslations} from 'next-intl'

interface Props {
  slug: string
  titleKey: string
  itemsKey: string
  ordered?: boolean
  className?: string
}

export function ContentSection({
  slug,
  titleKey,
  itemsKey,
  ordered = false,
  className,
}: Props) {
  const t = useTranslations('config')

  const fullTitleKey = `${slug}.${titleKey}`
  const fullItemsKey = `${slug}.${itemsKey}`

  if (!t.has(fullTitleKey) || !t.has(fullItemsKey)) return null

  const title = t(fullTitleKey)
  const items = t.raw(fullItemsKey) as string[]

  if (!Array.isArray(items) || items.length === 0) return null

  const List = ordered ? 'ol' : 'ul'

  return (
    <section className={cn('mt-8', className)}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <List
        className={cn(
          'mt-3 space-y-1.5 text-sm text-muted-foreground',
          ordered
            ? 'list-decimal list-outside pl-5'
            : 'list-disc list-outside pl-5',
        )}
      >
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </List>
    </section>
  )
}
