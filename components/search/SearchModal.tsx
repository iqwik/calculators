'use client'

import {Search} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useMemo, useState} from 'react'
import {getAllCalculators} from '@/data'
import {Link} from '@/i18n/navigation'
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '../ui/dialog'
import {Input} from '../ui/input'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({open, onOpenChange}: Props) {
  const t = useTranslations('home')
  const tConfig = useTranslations('config')
  const [query, setQuery] = useState('')

  const all = getAllCalculators()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all.slice(0, 8)
    return all.filter(
      calc =>
        calc.slug.includes(q) ||
        tConfig(calc.h1).toLowerCase().includes(q) ||
        tConfig(calc.description).toLowerCase().includes(q),
    )
  }, [all, query, tConfig])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('search.label')}</DialogTitle>
        </DialogHeader>

        <div className="relative border-b">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            type="search"
            placeholder={t('search.placeholder')}
            aria-label={t('search.label')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-12 rounded-none border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t('search.empty')}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {results.map(calc => (
                <li key={calc.slug}>
                  <Link
                    href={`/${calc.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="block rounded-md px-3 py-2 transition hover:bg-accent"
                  >
                    <div className="text-sm font-medium">
                      {tConfig(calc.h1)}
                    </div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {tConfig(calc.description)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
