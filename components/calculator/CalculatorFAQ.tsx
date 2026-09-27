import {getTranslations} from 'next-intl/server'
import type {FAQItem} from '@/types'

interface CalculatorFAQProps {
  items: FAQItem[]
}

export async function CalculatorFAQ({items}: CalculatorFAQProps) {
  const t = await getTranslations('config')
  const tUi = await getTranslations('calculator')

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900">{tUi('faq')}</h2>
      <div className="mt-4 space-y-3">
        {items.map(item => (
          <details
            key={item.q}
            className="group rounded-lg border border-gray-200 bg-white p-4"
          >
            <summary className="cursor-pointer font-medium text-gray-900 marker:content-none">
              {t(item.q)}
            </summary>
            <p className="mt-2 text-gray-600">{t(item.a)}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
