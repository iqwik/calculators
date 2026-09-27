'use client'

import {useTranslations} from 'next-intl'
import {getRelated} from '@/data'
import {Link} from '@/i18n/navigation'

interface Props {
  slugs: string[]
}

export function RelatedTools({slugs}: Props) {
  const t = useTranslations('calculator')
  const tConfig = useTranslations('config')
  const calculators = getRelated(slugs)

  if (calculators.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-xl font-bold">{t('related')}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {calculators.map(calc => (
          <Link
            key={calc.slug}
            href={`/${calc.slug}`}
            className="group rounded-xl border bg-card p-4 transition hover:border-primary"
          >
            <div className="font-semibold group-hover:text-primary">
              {tConfig(calc.h1)}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {tConfig(calc.description)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
