import {ArrowLeft} from 'lucide-react'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {getCategory, getRegistryEntriesByCategory} from '@/data'
import {Link} from '@/i18n/navigation'
import type {CategorySlug} from '@/types'
import {EntryPreview} from '../shared/EntryPreview'
import {Button} from '../ui/button'

interface Props {
  category: CategorySlug
}

export async function CategoryPage({category}: Props) {
  const cat = getCategory(category)
  if (!cat) notFound()

  const t = await getTranslations('home')
  const tCat = await getTranslations('category')

  const entries = getRegistryEntriesByCategory(category)

  return (
    <div className="page flex flex-col gap-6">
      <div data-role="header" className="flex items-center">
        <Button
          size="sm"
          variant="link"
          render={<Link href="/" />}
          nativeButton={false}
          className="h-11.5 gap-1.5 text-muted-foreground hover:text-muted-foreground/80"
        >
          <ArrowLeft className="size-6" />
        </Button>

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
            <EntryPreview key={entry.config.slug} slug={entry.config.slug} />
          ))}
        </div>
      </section>
    </div>
  )
}
