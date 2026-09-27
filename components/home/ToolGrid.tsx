'use client'

import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {getAllRegistryEntries} from '@/data'
import {Link} from '@/i18n/navigation'
import {Input} from '../ui/input'

const FILTERS = [
  'all',
  'calculators',
  'text',
  'health',
  'developer',
  'generators',
  'business',
] as const
type Filter = (typeof FILTERS)[number]

export function ToolGrid() {
  const t = useTranslations('home')
  const tConfig = useTranslations('config')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const all = useMemo(() => getAllRegistryEntries().map(e => e.config), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(item => {
      if (filter !== 'all' && filter !== 'calculators') {
        if (item.category !== filter) return false
      }
      if (!q) return true
      return item.slug.includes(q) || tConfig(item.h1).toLowerCase().includes(q)
    })
  }, [all, filter, query, tConfig])

  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <div className="mx-auto mb-9 max-w-md">
        <Input
          type="search"
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

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
            {t(`filters.${f}`)}
          </button>
        ))}
      </div>

      <div className="mb-4 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {t('toolsCount', {count: filtered.length})}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(item => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            className="group rounded-xl border bg-card p-5 transition hover:border-primary"
          >
            <h2 className="font-semibold group-hover:text-primary">
              {tConfig(item.h1)}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {tConfig(item.description)}
            </p>
            <span className="mt-3 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
              {item.category}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
