'use client'

import {ArrowRight02Icon} from '@animateicons/react/huge'
import {cn} from 'cn'
import {useTranslations} from 'next-intl'
import {useMemo, useRef} from 'react'
import {getRegistryEntry} from '@/data/registry'
import {Link} from '@/i18n/navigation'
import {IconHandle} from '@/types'

interface EntryPreviewProps {
  slug: string
}

export function EntryPreview({slug}: EntryPreviewProps) {
  const tConfig = useTranslations('config')
  const tGlobal = useTranslations('global')
  const tHome = useTranslations('home')

  const iconRef = useRef<IconHandle>(null)
  const arrowIconRef = useRef<IconHandle>(null)

  const entry = useMemo(() => getRegistryEntry(slug), [slug])
  if (!entry) return null

  const config = entry.config

  return (
    <Link
      href={`/${config.slug}`}
      onMouseEnter={() => {
        iconRef.current?.startAnimation()
        arrowIconRef.current?.startAnimation()
      }}
      onMouseLeave={() => {
        iconRef.current?.stopAnimation()
        arrowIconRef.current?.stopAnimation()
      }}
      className={cn(
        'group/tool flex h-40 flex-col relative',
        'rounded-xl border bg-card p-3 cursor-pointer',
        'transition-colors duration-300',
        'hover:border-primary',
      )}
    >
      <div className="flex flex-col grow">
        <div className="flex gap-2 items-center">
          <span className="size-8 rounded-sm flex items-center justify-center shrink-0 transition-colors duration-300 bg-secondary text-primary">
            <config.Icon ref={iconRef} isAnimated={false} className="size-6" />
          </span>
          <span className="font-semibold leading-5 transition-colors">
            {tConfig(config.h1)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {tConfig(config.description)}
        </p>
      </div>
      <div className="flex justify-between items-center mt-3 gap-2">
        <span
          key={config.tags[0]}
          className="font-tag rounded-sm px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-muted border text-muted-foreground"
        >
          {tHome(`filters.${config.tags[0]}`)}
        </span>
        <span className="text-primary text-sm flex items-center gap-1">
          {tGlobal('open')}
          <ArrowRight02Icon
            ref={arrowIconRef}
            isAnimated={false}
            className="size-4"
          />
        </span>
      </div>
    </Link>
  )
}
