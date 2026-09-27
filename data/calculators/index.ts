import type {CalculatorConfig} from '@/types'
import {financeCalculators} from './finance'
import {healthCalculators} from './health'

export const allCalculators: CalculatorConfig[] = [
  ...financeCalculators,
  ...healthCalculators,
]

export function getAllCalculators(): CalculatorConfig[] {
  return allCalculators
}

export function getCalculatorBySlug(
  slug: string,
): CalculatorConfig | undefined {
  return allCalculators.find(c => c.slug === slug)
}

export function getCalculatorsByCategory(category: string): CalculatorConfig[] {
  return allCalculators.filter(c => c.category === category)
}

export * from './finance'
export * from './health'
