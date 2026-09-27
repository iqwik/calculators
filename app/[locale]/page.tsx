import {getTranslations} from 'next-intl/server'
import {categories, getAllCalculators, getCalculatorsByCategory} from '@/data'
import {Link} from '@/i18n/navigation'

export default async function HomePage() {
  const t = await getTranslations('home')
  const all = getAllCalculators()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-3 text-lg text-gray-600">
        {t('subtitle', {count: all.length})}
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {categories.map(cat => {
          const calcs = getCalculatorsByCategory(cat.slug)
          return (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="text-3xl">{cat.icon}</div>
              <h2 className="mt-3 text-xl font-bold text-gray-900">
                {t(`categories.${cat.slug}.title`)}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t(`categories.${cat.slug}.description`)}
              </p>
              <div className="mt-3 text-sm font-medium text-blue-600">
                {calcs.length} →
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
