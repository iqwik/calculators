import {cn} from 'cn'
import {getTranslations} from 'next-intl/server'
import {isWideTool} from '@/data'
import {getBaseUrl} from '@/helpers'
import {Link} from '@/i18n/navigation'
import type {ToolConfig} from '@/types'
import {ContentSection} from '../shared/ContentSection'
import {FAQ} from '../shared/FAQ'
import {RelatedTools} from '../shared/RelatedTools'
import {Badge} from '../ui/badge'
import {ToolSchema} from './ToolSchema'
import {ToolView} from './ToolView'

interface Props {
  config: ToolConfig
}

export async function ToolLayout({config}: Props) {
  const tConfig = await getTranslations('config')
  const tNav = await getTranslations('nav')
  const tHome = await getTranslations('home')
  const baseUrl = getBaseUrl()
  const isWide = isWideTool(config.kind)

  return (
    <article className={cn('page', {'max-w-6xl': isWide})}>
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
          {tConfig(config.h1)}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {tConfig(config.description)}
        </p>
      </header>

      <ContentSection
        slug={config.slug}
        titleKey="howToUseTitle"
        itemsKey="howToUse"
        ordered
      />

      <ToolView config={config} />

      <ContentSection
        slug={config.slug}
        titleKey="featuresTitle"
        itemsKey="features"
      />
      <ContentSection
        slug={config.slug}
        titleKey="useCasesTitle"
        itemsKey="useCases"
      />

      {config.faq && config.faq.length > 0 && <FAQ items={config.faq} />}

      {config.related && config.related.length > 0 && (
        <RelatedTools slugs={config.related} />
      )}

      <ToolSchema tool={config} url={`${baseUrl}/${config.slug}`} />
    </article>
  )
}
