import {
  Braces,
  Briefcase,
  Calculator,
  FileText,
  HeartPulse,
  Zap,
} from 'lucide-react'
import {ComponentType, SVGProps} from 'react'
import type {CategorySlug} from '@/types'
import {getAllRegistryEntries, RegistryEntry} from './registry'

export interface Category {
  slug: CategorySlug
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const CATEGORY_COLORS: Record<
  CategorySlug,
  {
    color: string
    hoverColor: string
    background: string
    hoverBackground: string
    border: string
    hoverBorder: string
    shadow: string
  }
> = {
  generators: {
    color: 'text-blue-600 dark:text-blue-400',
    hoverColor: 'hover:text-blue-600 dark:hover:text-blue-400',
    background: 'bg-blue-50 dark:bg-blue-500/10',
    hoverBackground: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
    border: 'border border-blue-200 dark:border-blue-500/20',
    hoverBorder:
      'hover:border hover:border-blue-200 dark:hover:border-blue-500/20',
    shadow:
      'hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10',
  },
  finance: {
    color: 'text-emerald-600 dark:text-emerald-400',
    hoverColor: 'hover:text-emerald-600 dark:hover:text-emerald-400',
    background: 'bg-emerald-50 dark:bg-emerald-500/10',
    hoverBackground: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
    border: 'border border-emerald-200 dark:border-emerald-500/20',
    hoverBorder:
      'hover:border hover:border-emerald-200 dark:hover:border-emerald-500/20',
    shadow:
      'hover:shadow-lg hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10',
  },
  text: {
    color: 'text-amber-600 dark:text-amber-400',
    hoverColor: 'hover:text-amber-600 dark:hover:text-amber-400',
    background: 'bg-amber-50 dark:bg-amber-500/10',
    hoverBackground: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
    border: 'border border-amber-200 dark:border-amber-500/20',
    hoverBorder:
      'hover:border hover:border-amber-200 dark:hover:border-amber-500/20',
    shadow:
      'hover:shadow-lg hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10',
  },
  health: {
    color: 'text-rose-600 dark:text-rose-400',
    hoverColor: 'hover:text-rose-600 dark:hover:text-rose-400',
    background: 'bg-rose-50 dark:bg-rose-500/10',
    hoverBackground: 'hover:bg-rose-50 dark:hover:bg-rose-500/10',
    border: 'border border-rose-200 dark:border-rose-500/20',
    hoverBorder:
      'hover:border hover:border-rose-200 dark:hover:border-rose-500/20',
    shadow:
      'hover:shadow-lg hover:shadow-rose-500/20 dark:hover:shadow-rose-500/10',
  },
  developer: {
    color: 'text-violet-600 dark:text-violet-400',
    hoverColor: 'hover:text-violet-600 dark:hover:text-violet-400',
    background: 'bg-violet-50 dark:bg-violet-500/10',
    hoverBackground: 'hover:bg-violet-50 dark:hover:bg-violet-500/10',
    border: 'border border-violet-200 dark:border-violet-500/20',
    hoverBorder:
      'hover:border hover:border-violet-200 dark:hover:border-violet-500/20',
    shadow:
      'hover:shadow-lg hover:shadow-violet-500/20 dark:hover:shadow-violet-500/10',
  },
  business: {
    color: 'text-cyan-600 dark:text-cyan-400',
    hoverColor: 'hover:text-cyan-600 dark:hover:text-cyan-400',
    background: 'bg-cyan-50 dark:bg-cyan-500/10',
    hoverBackground: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10',
    border: 'border border-cyan-200 dark:border-cyan-500/20',
    hoverBorder:
      'hover:border hover:border-cyan-200 dark:hover:border-cyan-500/20',
    shadow:
      'hover:shadow-lg hover:shadow-cyan-500/20 dark:hover:shadow-cyan-500/10',
  },
}

export const categories: Category[] = [
  {
    slug: 'finance',
    Icon: Calculator,
  },
  {
    slug: 'health',
    Icon: HeartPulse,
  },
  {
    slug: 'text',
    Icon: FileText,
  },
  {
    slug: 'developer',
    Icon: Braces,
    // Icon: Code2,
  },
  {
    slug: 'generators',
    Icon: Zap,
  },
  {
    slug: 'business',
    Icon: Briefcase,
  },

  // {slug: 'finance', icon: '💰'}, // 'bg-blue-50 dark:bg-blue-500/10',
  // {slug: 'health', icon: '❤️'}, //   'bg-emerald-50 dark:bg-emerald-500/10',
  // {slug: 'text', icon: '✍️'}, //   'bg-amber-50 dark:bg-amber-500/10',
  // {slug: 'developer', icon: '{ }'}, //   'bg-rose-50 dark:bg-rose-500/10',
  // {slug: 'generators', icon: '⚡'}, //   'bg-violet-50 dark:bg-violet-500/10',
  // {slug: 'business', icon: '📄'}, //   'bg-cyan-50 dark:bg-cyan-500/10',
]

const CARD_COLORS = [
  'bg-blue-50 dark:bg-blue-500/10',
  'bg-emerald-50 dark:bg-emerald-500/10',
  'bg-amber-50 dark:bg-amber-500/10',
  'bg-rose-50 dark:bg-rose-500/10',
  'bg-violet-50 dark:bg-violet-500/10',
  'bg-cyan-50 dark:bg-cyan-500/10',
]

export function getCategoryBgColor(slug: CategorySlug): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
}

export function getCategory(slug: string) {
  return categories.find(c => c.slug === slug)
}

type ToolConfig = RegistryEntry['config']

export function getAllCategories() {
  const map = new Map<
    CategorySlug,
    Category & {tools: Array<Pick<ToolConfig, 'slug' | 'title' | 'Icon'>>}
  >()

  for (const category of categories) {
    map.set(category.slug, {...category, tools: []})
  }

  const allTools = getAllRegistryEntries()
  for (let i = 0; i < allTools.length; i++) {
    const tool = allTools[i].config
    const category = map.get(tool.category)
    if (isCategory(category)) {
      const tools = category?.tools || []
      tools.push({
        slug: tool.slug,
        title: tool.title,
        Icon: tool.Icon,
      })
      map.set(tool.category, {...category, tools})
    }
  }
  return Array.from(map.values())

  function isCategory(v: Category | undefined): v is Category {
    return !!v && typeof v === 'object'
  }
}
