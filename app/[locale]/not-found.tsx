import {getTranslations} from 'next-intl/server'
import {categories} from '@/data'
import {Link} from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  const tNav = await getTranslations('nav')

  return (
    <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="text-6xl">🔍</div>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-3 text-gray-600">{t('text')}</p>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          {t('home')}
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900">{t('popular')}</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition hover:border-blue-300"
            >
              {cat.icon} {tNav(cat.slug)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
