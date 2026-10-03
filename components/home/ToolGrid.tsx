'use client'

import {AnimatePresence, motion} from 'motion/react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {getAllRegistryEntries} from '@/data'
import {Tag} from '@/types'
import {EntryPreview} from '../shared/EntryPreview'
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
  const tCategory = useTranslations('category')
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

      <div className="font-tag mb-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
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
            {filtered.map(config => (
              <motion.div
                key={config.slug}
                layout="position"
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.9}}
                transition={SPRING}
                className="h-full"
              >
                <EntryPreview slug={config.slug} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  )
}
