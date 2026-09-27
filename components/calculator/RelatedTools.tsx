import {getTranslations} from 'next-intl/server'
import {Link} from '@/i18n/navigation'
import type {CalculatorConfig} from '@/types'

interface RelatedToolsProps {
  calculators: CalculatorConfig[]
}

export async function RelatedTools({calculators}: RelatedToolsProps) {
  if (calculators.length === 0) return null

  const t = await getTranslations('config')
  const tUi = await getTranslations('calculator')

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900">{tUi('related')}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {calculators.map(calc => (
          <Link
            key={calc.slug}
            href={`/${calc.category}/${calc.slug}`}
            className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <div className="font-medium text-gray-900">{t(calc.h1)}</div>
            <div className="mt-1 text-sm text-gray-500 line-clamp-2">
              {t(calc.description)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
