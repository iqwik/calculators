import {getTranslations} from 'next-intl/server'
import {buttonVariants} from '@/components/ui/button'
import {categories} from '@/data'
import {Link} from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  const tHome = await getTranslations('home')

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <div className="text-6xl" aria-hidden="true">
        🔍
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-3 text-muted-foreground">{t('text')}</p>

      <div className="mt-8">
        <Link href="/" className={buttonVariants()}>
          {t('home')}
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold">{t('popular')}</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/5"
            >
              <span aria-hidden="true">{cat.icon}</span>
              {tHome(`categories.${cat.slug}`)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
