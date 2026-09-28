'use client'

import {cn} from 'cn'
import {AnimatePresence, motion} from 'motion/react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {getAllRegistryEntries} from '@/data'
import {Link} from '@/i18n/navigation'
import {Tag} from '@/types'

const FILTERS: (Tag | 'all')[] = [
  'all',
  'calculator',
  'text',
  'health',
  'developer',
  'generators',
  'business',
]
type Filter = (typeof FILTERS)[number]

const CARD_COLORS = [
  'bg-blue-50 dark:bg-blue-500/10',
  'bg-emerald-50 dark:bg-emerald-500/10',
  'bg-amber-50 dark:bg-amber-500/10',
  'bg-rose-50 dark:bg-rose-500/10',
  'bg-violet-50 dark:bg-violet-500/10',
  'bg-cyan-50 dark:bg-cyan-500/10',
]

function colorForSlug(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
}

export function ToolGrid() {
  const tHome = useTranslations('home')
  const tConfig = useTranslations('config')
  const [filter, setFilter] = useState<Filter>('all')

  const all = useMemo(() => getAllRegistryEntries().map(e => e.config), [])

  const filtered = useMemo(() => {
    return all.filter(item => {
      if (filter !== 'all' && !item.tags.includes(filter)) return false
      return true
    })
  }, [all, filter])

  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filter === f
                ? 'border-primary bg-primary/10 text-primary'
                : 'hover:border-primary hover:bg-primary/5'
            }`}
          >
            {tHome(`filters.${f}`)}
          </button>
        ))}
      </div>

      <div className="mb-4 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {tHome('toolsCount', {count: filtered.length})}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.slug}
              layout
              initial={{opacity: 0, y: 12}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, scale: 0.95}}
              transition={{duration: 0.2, delay: i * 0.03, ease: 'easeOut'}}
              className="h-full"
            >
              <Link
                href={`/${item.slug}`}
                className={cn(
                  'group flex h-full flex-col',
                  'rounded-xl border bg-card p-5 transition-all duration-200',
                  'hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
                  colorForSlug(item.slug),
                )}
              >
                <h2 className="font-semibold transition-colors group-hover:text-primary">
                  {tConfig(item.h1)}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {tConfig(item.description)}
                </p>
                <span className="mt-auto inline-block self-start rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase transition-colors group-hover:border-primary/30 group-hover:text-primary">
                  {tHome(`categories.${item.category}`)}
                </span>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
