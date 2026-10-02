'use client'

import {cn} from 'cn'
import {ArrowRight} from 'lucide-react'
import {AnimatePresence, motion} from 'motion/react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {CATEGORY_COLORS, getAllRegistryEntries} from '@/data'
import {Link} from '@/i18n/navigation'
import {Tag} from '@/types'
import {Button} from '../ui/button'

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

const SPRING = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 45,
  mass: 0.8,
}

export function ToolGrid() {
  const tHome = useTranslations('home')
  const tConfig = useTranslations('config')
  const tCategory = useTranslations('category')
  const tGlobal = useTranslations('global')
  const [filter, setFilter] = useState<Filter>('all')

  const all = useMemo(() => getAllRegistryEntries().map(e => e.config), [])
  const shuffled = useMemo(() => {
    return seededShuffle(all, 42)

    function seededShuffle<T>(arr: T[], seed: number): T[] {
      const a = [...arr]
      let s = seed
      const rand = () => {
        s = (s * 9301 + 49297) % 233280
        return s / 233280
      }
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
  }, [all])

  const filtered = useMemo(
    () =>
      shuffled.filter(item => filter === 'all' || item.tags.includes(filter)),
    [shuffled, filter],
  )

  return (
    <section className="page">
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {FILTERS.map(f => (
          <Button
            key={f}
            variant={f === filter ? 'alternative' : 'secondary'}
            onClick={() => {
              setFilter(f)
            }}
          >
            {tHome(`filters.${f}`)}
          </Button>
        ))}
      </div>

      <div className="font-tag mb-2 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {tCategory('toolsCount', {count: filtered.length})}
      </div>

      <motion.div
        layout
        transition={SPRING}
        style={{
          overflow: 'hidden',
          padding: 14,
          margin: -14,
        }}
      >
        <motion.div
          layout="position"
          layoutScroll
          transition={SPRING}
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="sync" initial={false}>
            {filtered.map(tool => {
              const s = CATEGORY_COLORS[tool.category]
              return (
                <motion.div
                  key={tool.slug}
                  layout="position"
                  initial={{opacity: 0, scale: 0.9}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.9}}
                  transition={SPRING}
                  className="h-full"
                >
                  <Link
                    href={`/${tool.slug}`}
                    className={cn(
                      'group/tool flex h-40 flex-col relative',
                      'rounded-xl border bg-card p-3',
                      'transition-colors duration-300',
                      'hover:border-primary',
                    )}
                  >
                    <div className="flex flex-col grow">
                      <div className="flex gap-2 items-center">
                        <span
                          className={cn(
                            'size-8 rounded-sm flex items-center justify-center shrink-0 transition-colors duration-300',
                            'text-primary bg-secondary',
                            'group-hover/tool:bg-primary group-hover/tool:text-card',
                          )}
                        >
                          <tool.Icon className="size-6" />
                        </span>
                        <span className="font-semibold text-md leading-5 transition-colors">
                          {tConfig(tool.h1)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {tConfig(tool.description)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-3 gap-2">
                      <span
                        key={tool.tags[0]}
                        className={cn(
                          'font-tag rounded-sm px-2.5 py-0.5 text-[9px] font-medium tracking-wide uppercase',
                          'bg-muted border text-muted-foreground',
                        )}
                      >
                        {tHome(`filters.${tool.tags[0]}`)}
                      </span>
                      <span className="text-primary text-xs flex items-center gap-1">
                        {tGlobal('open')}
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  )
}
