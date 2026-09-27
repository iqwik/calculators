import {ArrowLeft} from 'lucide-react'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {getCalculatorsByCategory, getCategory} from '@/data'
import {Link} from '@/i18n/navigation'
import type {CategorySlug} from '@/types'
import {Badge} from '../ui/badge'
import {Button} from '../ui/button'
import {CategoryIcon} from '../ui/category-icon'

interface Props {
  category: CategorySlug
}

export async function CategoryPage({category}: Props) {
  const cat = getCategory(category)
  if (!cat) notFound()

  const t = await getTranslations('home')
  const tCat = await getTranslations('category')
  const tConfig = await getTranslations('config')

  const calculators = getCalculatorsByCategory(category)

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Button
        variant="ghost"
        size="sm"
        render={<Link href="/" />}
        className="mb-6 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCat('backHome')}
      </Button>

      <header className="mb-10">
        <Badge
          variant="outline"
          className="mb-4 gap-2 rounded-full border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase"
        >
          <CategoryIcon slug={category} className="h-3.5 w-3.5" />
          {t(`categories.${category}`)}
        </Badge>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t(`categories.${category}`)}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          {tCat('toolsCount', {count: calculators.length})}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map(calc => (
          <Link
            key={calc.slug}
            href={`/${calc.slug}`}
            className="group rounded-xl border bg-card p-5 transition hover:border-primary"
          >
            <h2 className="font-semibold group-hover:text-primary">
              {tConfig(calc.h1)}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {tConfig(calc.description)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
