import type {ToolConfig} from '@/types'
import {developerTools} from './developer'

export const tools: ToolConfig[] = [...developerTools]

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
