import {cn} from 'cn'
import {ArrowLeft} from 'lucide-react'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {
  CATEGORY_COLORS,
  getCategory,
  getRegistryEntriesByCategory,
} from '@/data'
import {Link} from '@/i18n/navigation'
import type {CategorySlug} from '@/types'
import {Button} from '../ui/button'

interface Props {
  category: CategorySlug
}

export async function CategoryPage({category}: Props) {
  const cat = getCategory(category)
  if (!cat) notFound()

  const catColors = CATEGORY_COLORS[cat.slug]
  const t = await getTranslations('home')
  const tCat = await getTranslations('category')
  const tConfig = await getTranslations('config')

  const entries = getRegistryEntriesByCategory(category)

  return (
    <div className="page flex flex-col gap-6">
      <div data-role="header" className="flex gap-2 items-center">
        <Button
          size="sm"
          variant="link"
          render={<Link href="/" />}
          nativeButton={false}
          className="h-11.5 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-6" />
          {/* {tCat('backHome')} */}
        </Button>

        <span className="size-8 flex items-center justify-center rounded-md text-card bg-primary">
          <cat.Icon className="size-6" />
        </span>

        <h1 className="text-2xl  font-bold tracking-tight sm:text-3xl">
          {t(`categories.${category}`)}
        </h1>
      </div>
      <section className="flex flex-col gap-2">
        <p className="font-tag text-xs font-bold tracking-[0.14em] uppercase text-muted-foreground">
          {tCat('toolsCount', {count: entries.length})}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(entry => (
            <Link
              key={entry.config.slug}
              href={`/${entry.config.slug}`}
              className={cn(
                'group/category rounded-lg bg-card border p-5 transition-colors duration-300 hover:border-primary',
              )}
            >
              <div className="flex gap-2 items-center">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg text-lg leading-none',
                    'transition-colors duration-300',
                    'bg-muted border text-muted-foreground',
                    'group-hover/category:bg-primary group-hover/category:text-card',
                  )}
                  aria-hidden="true"
                >
                  <entry.config.Icon className="size-6" />
                </span>
                <span className="font-semibold group-hover:text-primary">
                  {tConfig(entry.config.h1)}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {tConfig(entry.config.description)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
