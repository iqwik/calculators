import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {CalculatorFAQ} from '@/components/calculator/CalculatorFAQ'
import {CalculatorForm} from '@/components/calculator/CalculatorForm'
import {CalculatorSchema} from '@/components/calculator/CalculatorSchema'
import {RelatedTools} from '@/components/calculator/RelatedTools'
import {Badge} from '@/components/ui/badge'
import {getAllCalculators, getCalculatorBySlug} from '@/data'
import {getBaseUrl} from '@/helpers'
import {Link} from '@/i18n/navigation'

interface PageProps {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  return getAllCalculators().map(calc => ({slug: calc.slug}))
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug} = await params
  const calc = getCalculatorBySlug(slug)
  if (!calc) return {}

  const t = await getTranslations('config')
  const baseUrl = getBaseUrl()

  return {
    title: t(calc.title),
    description: t(calc.description),
    alternates: {
      canonical: `${baseUrl}/${calc.slug}`,
      languages: {
        en: `${baseUrl}/${calc.slug}`,
        ru: `${baseUrl}/ru/${calc.slug}`,
      },
    },
  }
}

export default async function CalculatorPage({params}: PageProps) {
  const {slug} = await params
  const calc = getCalculatorBySlug(slug)
  if (!calc) notFound()

  const t = await getTranslations('config')
  const tNav = await getTranslations('nav')
  const tHome = await getTranslations('home')
  const baseUrl = getBaseUrl()

  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {tNav('home')}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${calc.category}`} className="hover:text-foreground">
          {tHome(`categories.${calc.category}`)}
        </Link>
      </nav>

      <header className="mb-8">
        <Badge
          variant="outline"
          className="mb-4 rounded-full border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase"
        >
          {tHome(`categories.${calc.category}`)}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t(calc.h1)}
        </h1>
        <p className="mt-3 text-muted-foreground">{t(calc.description)}</p>
      </header>

      <div className="rounded-xl border bg-card p-6">
        <CalculatorForm slug={slug} />
      </div>

      {calc.faq && calc.faq.length > 0 && <CalculatorFAQ items={calc.faq} />}

      {calc.related && calc.related.length > 0 && (
        <RelatedTools slugs={calc.related} />
      )}

      <CalculatorSchema calc={calc} url={`${baseUrl}/${calc.slug}`} />
    </article>
  )
}
