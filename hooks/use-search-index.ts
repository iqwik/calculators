'use client'

import Fuse from 'fuse.js'
import {useMessages} from 'next-intl'
import {useMemo} from 'react'
import {getAllRegistryEntries} from '@/data'

export interface SearchItem {
  slug: string
  title: string
  description: string
  keywords: string[]
  synonyms: string[]
}

export function useSearchIndex() {
  const messages = useMessages()

  return useMemo(() => {
    const entries = getAllRegistryEntries()
    const config = (messages as Record<string, unknown>)?.config as
      | Record<string, {h1?: string; description?: string; keywords?: string}>
      | undefined

    const synonymsMap = (messages as Record<string, unknown>)?.searchSynonyms as
      | Record<string, string[]>
      | undefined

    const items: SearchItem[] = entries.map(entry => {
      const slug = entry.config.slug
      const cfg = config?.[slug] ?? {}
      const syn = synonymsMap?.[slug] ?? []

      const keywords =
        typeof cfg.keywords === 'string'
          ? cfg.keywords
              .split(',')
              .map(k => k.trim())
              .filter(Boolean)
          : []

      return {
        slug,
        title: cfg.h1 ?? slug,
        description: cfg.description ?? '',
        keywords,
        synonyms: Array.isArray(syn) ? syn : [],
      }
    })

    return new Fuse(items, {
      keys: [
        {name: 'title', weight: 0.5},
        {name: 'keywords', weight: 0.3},
        {name: 'synonyms', weight: 0.15},
        {name: 'description', weight: 0.05},
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
      useTokenSearch: true,
    })
  }, [messages])
}
