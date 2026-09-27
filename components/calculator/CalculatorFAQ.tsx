'use client'

import {useTranslations} from 'next-intl'
import type {FAQItem} from '@/types'

interface Props {
  items: FAQItem[]
}

export function CalculatorFAQ({items}: Props) {
  const t = useTranslations('calculator')
  const tConfig = useTranslations('config')

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-xl font-bold">{t('faq')}</h2>
      <div className="space-y-4">
        {items.map(item => (
          <details
            key={item.q}
            className="group rounded-xl border bg-card p-4 open:bg-muted/20"
          >
            <summary className="cursor-pointer list-none font-medium">
              {tConfig(item.q)}
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              {tConfig(item.a)}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
