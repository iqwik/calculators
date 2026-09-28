import type {ToolConfig} from '@/types'
import {businessTools} from './business'
import {developerTools} from './developer'
import {generatorTools} from './generators'
import {textTools} from './text'

export const tools: ToolConfig[] = [
  ...developerTools,
  ...textTools,
  ...generatorTools,
  ...businessTools,
]

export function getAllTools(): ToolConfig[] {
  return tools
}

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools.find(t => t.slug === slug)
}

export function getToolsByCategory(
  category: ToolConfig['category'],
): ToolConfig[] {
  return tools.filter(t => t.category === category)
}
