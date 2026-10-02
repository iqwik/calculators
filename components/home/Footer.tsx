import {cn} from 'cn'
import {ShieldCheck} from 'lucide-react'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import {useMemo} from 'react'
import {CATEGORY_COLORS, getAllCategories} from '@/data'

export function Footer() {
  const tHome = useTranslations('home')
  const tCategory = useTranslations('category')

  const categories = useMemo(() => getAllCategories(), [])

  return (
    <section className="page flex flex-col gap-6 pt-0">
      <div className="p-3.5 border rounded-md bg-muted">
        <div className="flex gap-2 items-start">
          <span className="shrink-0 size-18 flex items-center justify-center bg-card border rounded-sm">
            <ShieldCheck className="size-10" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{tHome('privacy.label')}</span>
            <p className="text-muted-foreground text-sm">
              {tHome('privacy.text')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2">
        {categories.map(cat => {
          const s = CATEGORY_COLORS[cat.slug]
          return (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className={cn(
                'group/category flex flex-col items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium',
                'transition-colors duration-300 hover:border-primary',
                // s.hoverColor,
                // s.hoverBorder,
                // s.hoverBackground,
              )}
            >
              <div className="flex flex-col flex-1 items-center justify-center gap-0.5">
                <span className="shrink-0 size-8 transition-colors duration-300 bg-muted text-muted-foreground border p-0.5 rounded-sm group-hover/category:bg-primary group-hover/category:text-card flex items-center justify-center">
                  <cat.Icon aria-hidden="true" />
                </span>
                <span className="flex-1 text-center">
                  {tCategory(`title.${cat.slug}`)}
                </span>
              </div>
              <span className="shrink-0 bg-muted w-6 p-0.5 rounded-sm flex justify-center items-center text-xs truncate">
                {cat.tools.length}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
