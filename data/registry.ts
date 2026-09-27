import type {CalculatorConfig, CategorySlug, ToolConfig} from '@/types'
import {getAllCalculators, getCalculatorBySlug} from './calculators'
import {getAllTools, getToolBySlug} from './tools'

export type RegistryEntry =
  | {type: 'calculator'; config: CalculatorConfig}
  | {type: 'tool'; config: ToolConfig}

export function getRegistryEntry(slug: string): RegistryEntry | undefined {
  const calc = getCalculatorBySlug(slug)
  if (calc) return {type: 'calculator', config: calc}

  const tool = getToolBySlug(slug)
  if (tool) return {type: 'tool', config: tool}

  return undefined
}

export function getAllRegistryEntries(): RegistryEntry[] {
  return [
    ...getAllCalculators().map(config => ({
      type: 'calculator' as const,
      config,
    })),
    ...getAllTools().map(config => ({type: 'tool' as const, config})),
  ]
}

export function getRegistryEntriesByCategory(
  category: CategorySlug,
): RegistryEntry[] {
  return getAllRegistryEntries().filter(
    entry => entry.config.category === category,
  )
}
