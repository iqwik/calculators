import {getTranslations} from 'next-intl/server'
import {getBaseUrl} from '@/helpers'
import {Link} from '@/i18n/navigation'
import type {CalculatorConfig} from '@/types'
import {FAQ} from '../shared/FAQ'
import {RelatedTools} from '../shared/RelatedTools'
import {Badge} from '../ui/badge'
import {CalculatorForm} from './CalculatorForm'
import {CalculatorSchema} from './CalculatorSchema'

interface Props {
  config: CalculatorConfig
}

export async function CalcLayout({config}: Props) {
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
        <Link href={`/${config.category}`} className="hover:text-foreground">
          {tHome(`categories.${config.category}`)}
        </Link>
      </nav>

      <header className="mb-8">
        <Badge
          variant="outline"
          className="mb-4 rounded-full border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase"
        >
          {tHome(`categories.${config.category}`)}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t(config.h1)}
        </h1>
        <p className="mt-3 text-muted-foreground">{t(config.description)}</p>
      </header>

      <div className="rounded-xl border bg-card p-6">
        <CalculatorForm slug={config.slug} />
      </div>

      {config.faq && config.faq.length > 0 && <FAQ items={config.faq} />}

      {config.related && config.related.length > 0 && (
        <RelatedTools slugs={config.related} />
      )}

      <CalculatorSchema calc={config} url={`${baseUrl}/${config.slug}`} />
    </article>
  )
}
