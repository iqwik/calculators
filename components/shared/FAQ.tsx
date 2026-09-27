'use client'

import {useTranslations} from 'next-intl'
import type {FAQItem} from '@/types'

interface Props {
  items: FAQItem[]
}

export function FAQ({items}: Props) {
  const t = useTranslations('global')
  const tConfig = useTranslations('config')

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">{t('faq')}</h2>
      <div className="space-y-6">
        {items.map(item => (
          <div
            key={item.q}
            className="border-b border-border pb-6 last:border-0 last:pb-0"
          >
            <h3 className="mb-2 text-lg font-semibold">{tConfig(item.q)}</h3>
            <p className="leading-relaxed text-muted-foreground">
              {tConfig(item.a)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
