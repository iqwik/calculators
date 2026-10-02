'use client'

import {TooltipPositionerProps} from '@base-ui/react/tooltip'
import {cn} from 'cn'
import {Search} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip'
import {useSearch} from './SearchProvider'

interface Props {
  variant?: 'full' | 'icon'
  tooltip?: boolean
  tooltipSide?: TooltipPositionerProps['side']
  placeholder?: string
  buttonClassName?: string
  kbdClassName?: string
}

export function SearchTrigger({
  variant = 'full',
  tooltip,
  tooltipSide = 'bottom',
  placeholder,
  buttonClassName,
  kbdClassName,
}: Props) {
  const t = useTranslations('home')
  const {setOpen} = useSearch()
  const [modKey, setModKey] = useState('Ctrl')

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
    setModKey(isMac ? '⌘' : 'Ctrl')
  }, [])

  const isFull = variant === 'full'
  const hotKey = `${modKey}+K`

  const button = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={t('search.label')}
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        'group/search relative inline-flex h-8 shrink-0 items-center rounded-md',
        'text-sm text-muted-foreground outline-none cursor-pointer bg-transparent',
        'transition-[width,background-color] duration-200 ease-linear',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isFull ? 'w-full' : 'w-8 hover:bg-accent hover:text-foreground',
        buttonClassName,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-md border border-border',
          'transition-opacity duration-200 ease-linear',
          isFull ? 'opacity-100' : 'opacity-0',
        )}
      />

      <span className="relative flex size-8 shrink-0 items-center justify-center">
        <Search className="size-4" />
      </span>

      {isFull && (
        <>
          <span className="min-w-0 flex-1 truncate pr-2 text-left">
            {placeholder || t('search.label')}
          </span>

          <kbd
            data-slot="kbd"
            className={cn(
              'mr-3 hidden shrink-0 rounded border bg-background',
              'px-1.5 font-mono text-[10px] text-muted-foreground/80',
              'sm:inline-block sm:opacity-0 sm:group-hover/search:opacity-100',
              'transition-opacity duration-200 ease-out',
              kbdClassName,
            )}
          >
            {modKey}+K
          </kbd>
        </>
      )}
    </button>
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex w-full" />}>
        {button}
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>
        {t('search.label')} {hotKey}
      </TooltipContent>
    </Tooltip>
  )
}
