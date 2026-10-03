'use client'

import {cn} from 'cn'
import {Search} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {useSearchIndex} from '@/hooks/use-search-index'
import {Link} from '@/i18n/navigation'
import {highlighted} from '../shared/Highlight'
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

  const fuse = useSearchIndex()

  const results = useMemo(() => {
    const q = query.trim()
    if (q.length < 2) return []
    return fuse.search(q, {limit: 20}).map(r => r.item)
  }, [fuse, query])

  // useEffect(() => {
  //   if (!open) setQuery('')
  // }, [open])

  const hasQuery = query.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[15%] max-w-2xl translate-y-0 gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('search.label')}</DialogTitle>
        </DialogHeader>

        <div className={cn('relative', {'border-b': hasQuery})}>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            type="text"
            placeholder={t('search.placeholder')}
            aria-label={t('search.label')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-12 rounded-none border-0 bg-transparent pr-10 pl-10 text-base shadow-none focus-visible:ring-0"
          />
        </div>

        {hasQuery && (
          <div className="h-150 max-h-[70vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  {t('search.empty')}
                </p>
              </div>
            ) : (
              <ul className="space-y-0.5">
                {results.map(item => (
                  <li key={item.slug}>
                    <Link
                      href={`/${item.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="block rounded-md px-3 py-2 transition hover:bg-accent"
                    >
                      <div className="text-sm font-medium">
                        {highlighted({
                          highlight: query,
                          text: tConfig(`${item.slug}.h1`),
                        })}
                      </div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {highlighted({
                          highlight: query,
                          text: tConfig(`${item.slug}.description`),
                        })}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
