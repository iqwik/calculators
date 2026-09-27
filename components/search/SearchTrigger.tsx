'use client'

import {Search} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'
import {SearchModal} from './SearchModal'

interface Props {
  variant?: 'full' | 'icon'
}

export function SearchTrigger({variant = 'full'}: Props) {
  const t = useTranslations('home')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {variant === 'full' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-full items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground transition hover:bg-muted"
          aria-label={t('search.label')}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">{t('search.placeholder')}</span>
          <kbd className="ml-auto hidden rounded border bg-background px-1.5 font-mono text-[10px] sm:inline-block">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label={t('search.label')}
        >
          <Search className="h-4 w-4" />
        </button>
      )}

      <SearchModal open={open} onOpenChange={setOpen} />
    </>
  )
}
