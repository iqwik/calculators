import type {CalculatorConfig} from '@/types'
import {datetimeCalculators, healthCalculators} from './calculators'
import {categories} from './categories'

export {categories}
export type {Category} from './categories'

export const allCalculators: CalculatorConfig[] = [
  ...healthCalculators,
  ...datetimeCalculators,
]

export function getAllCalculators(): CalculatorConfig[] {
  return allCalculators
}

export function getCalculator(
  category: string,
  slug: string,
): CalculatorConfig | undefined {
  return allCalculators.find(c => c.category === category && c.slug === slug)
}

export function getCalculatorsByCategory(category: string): CalculatorConfig[] {
  return allCalculators.filter(c => c.category === category)
}

export function getCategory(slug: string) {
  return categories.find(c => c.slug === slug)
}

export function getRelated(slugs: string[]): CalculatorConfig[] {
  return slugs
    .map(s => allCalculators.find(c => c.slug === s))
    .filter((c): c is CalculatorConfig => Boolean(c))
}
