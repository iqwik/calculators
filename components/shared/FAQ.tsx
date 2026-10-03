'use client'

import {useTranslations} from 'next-intl'
import type {FAQItem} from '@/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'

interface Props {
  items: FAQItem[]
}

export function FAQ({items}: Props) {
  const t = useTranslations('global')
  const tConfig = useTranslations('config')

  if (items.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">{t('faq')}</h2>
      <Accordion className="w-full" multiple>
        {items.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold hover:no-underline cursor-pointer">
              {tConfig(item.q)}
            </AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">
              {tConfig(item.a)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
