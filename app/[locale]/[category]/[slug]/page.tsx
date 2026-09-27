import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {
  CalculatorFAQ,
  CalculatorForm,
  CalculatorSchema,
  RelatedTools,
} from '@/components/calculator'
import {getAllCalculators, getCalculator, getRelated} from '@/data'
import {Link} from '@/i18n/navigation'

interface PageProps {
  params: Promise<{category: string; slug: string}>
}

export async function generateStaticParams() {
  return getAllCalculators().map(calc => ({
    category: calc.category,
    slug: calc.slug,
  }))
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {category, slug} = await params
  const calc = getCalculator(category, slug)
  if (!calc) return {}

  const t = await getTranslations('config')

  return {
    title: t(calc.title),
    description: t(calc.description),
    keywords: t(calc.keywords[0])
      .split(',')
      .map(k => k.trim()),
    alternates: {
      canonical: `/${calc.category}/${calc.slug}`,
      languages: {
        en: `/${calc.category}/${calc.slug}`,
        ru: `/ru/${calc.category}/${calc.slug}`,
      },
    },
  }
}

export default async function CalculatorPage({params}: PageProps) {
  const {category, slug} = await params
  const calc = getCalculator(category, slug)
  if (!calc) notFound()

  const t = await getTranslations('config')
  const tNav = await getTranslations('nav')
  const related = getRelated(calc.related ?? [])

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">
          {tNav('home')}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${calc.category}`} className="hover:text-blue-600">
          {tNav(calc.category)}
        </Link>
      </nav>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">{t(calc.h1)}</h1>
      <p className="mt-3 text-gray-600">{t(calc.description)}</p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <CalculatorForm category={category} slug={slug} />
      </div>

      {calc.faq && calc.faq.length > 0 && <CalculatorFAQ items={calc.faq} />}

      {related.length > 0 && <RelatedTools calculators={related} />}

      <CalculatorSchema config={calc} />
    </article>
  )
}
