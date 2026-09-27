import {useTranslations} from 'next-intl'
import {categories} from '@/data'
import {Link} from '@/i18n/navigation'
import {Badge} from '../ui/badge'

export function Hero() {
  const t = useTranslations('home')

  return (
    <section className="px-6 py-16 text-center sm:py-20">
      <Badge
        variant="outline"
        className="mb-6 gap-2 rounded-full border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-primary uppercase"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {t('badge')}
      </Badge>

      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
        {t('h1')}
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
        {t('subtitle')}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/5"
          >
            <span aria-hidden="true">{cat.icon}</span>
            {t(`categories.${cat.slug}`)}
          </Link>
        ))}
      </div>
    </section>
  )
}
