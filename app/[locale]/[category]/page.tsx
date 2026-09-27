import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {categories, getCalculatorsByCategory, getCategory} from '@/data'
import {Link} from '@/i18n/navigation'

interface PageProps {
  params: Promise<{category: string}>
}

export async function generateStaticParams() {
  return categories.map(c => ({category: c.slug}))
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {category} = await params
  const cat = getCategory(category)
  if (!cat) return {}

  const t = await getTranslations('home')

  return {
    title: t(`categories.${cat.slug}.title`),
    description: t(`categories.${cat.slug}.description`),
    alternates: {
      canonical: `/${cat.slug}`,
      languages: {
        en: `/${cat.slug}`,
        ru: `/ru/${cat.slug}`,
      },
    },
  }
}

export default async function CategoryPage({params}: PageProps) {
  const {category} = await params
  const cat = getCategory(category)
  if (!cat) notFound()

  const t = await getTranslations('home')
  const tConfig = await getTranslations('config')
  const tNav = await getTranslations('nav')
  const calculators = getCalculatorsByCategory(category)

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">
          {tNav('home')}
        </Link>
        <span className="mx-2">/</span>
        <span>{t(`categories.${cat.slug}.title`)}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        {cat.icon} {t(`categories.${cat.slug}.title`)}
      </h1>
      <p className="mt-3 text-gray-600">
        {t(`categories.${cat.slug}.description`)}
      </p>

      <div className="mt-8 space-y-3">
        {calculators.map(calc => (
          <Link
            key={calc.slug}
            href={`/${calc.category}/${calc.slug}`}
            className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <div className="font-medium text-gray-900">{tConfig(calc.h1)}</div>
            <div className="mt-1 text-sm text-gray-500">
              {tConfig(calc.description)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
