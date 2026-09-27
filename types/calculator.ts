export type CategorySlug =
  | 'finance'
  | 'health'
  | 'text'
  | 'developer'
  | 'generators'
  | 'business'

export type InputType = 'number' | 'text' | 'date' | 'select'

export interface Option {
  value: string
  label: string
}

export interface InputField {
  name: string
  label: string
  type: InputType
  unit?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  options?: Option[]
  defaultValue?: string | number
  hint?: string
}

export interface ResultRange {
  max: number
  label: string
  color: 'blue' | 'green' | 'orange' | 'red' | 'gray'
}

export interface FAQItem {
  q: string
  a: string
}

export type Values = Record<string, string | number>

export interface CalculationOutput {
  value: number | string
  raw?: number
  secondary?: Option[]
}

export interface CalculatorConfig {
  slug: string
  category: CategorySlug
  title: string
  h1: string
  description: string
  keywords: string[]
  inputs: InputField[]
  calculate: (values: Values) => CalculationOutput
  resultLabel: string
  resultUnit?: string
  ranges?: ResultRange[]
  faq?: FAQItem[]
  related?: string[]
  publishedAt?: string
}
