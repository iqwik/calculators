'use client'

import {useTranslations} from 'next-intl'
import {getCalculatorBySlug, getToolBySlug} from '@/data'
import {Link} from '@/i18n/navigation'

interface Props {
  slugs: string[]
}

export function RelatedTools({slugs}: Props) {
  const t = useTranslations('global')
  const tConfig = useTranslations('config')

  if (slugs.length === 0) return null

  const items = slugs
    .map(slug => {
      const calc = getCalculatorBySlug(slug)
      if (calc) return {slug, titleKey: calc.h1}
      const tool = getToolBySlug(slug)
      if (tool) return {slug, titleKey: tool.h1}
      return null
    })
    .filter((x): x is {slug: string; titleKey: string} => x !== null)

  if (items.length === 0) return null

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-4 text-xl font-bold">{t('related')}</h2>
      <ul className="space-y-1">
        {items.map(item => (
          <li key={item.slug}>
            <Link
              href={`/${item.slug}`}
              className="text-primary hover:underline"
            >
              {tConfig(item.titleKey)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
