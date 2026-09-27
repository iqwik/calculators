import {FAQItem} from './common'

export type ToolKind = 'unit-converter' | 'json-formatter' | 'base64'

/** Общие поля для всех tool-конфигов */
export interface BaseToolConfig {
  slug: string
  category:
    | 'finance'
    | 'health'
    | 'text'
    | 'developer'
    | 'generators'
    | 'business'
  title: string
  h1: string
  description: string
  keywords: string[]
  faq?: FAQItem[]
  related?: string[]
  publishedAt?: string
}

export interface UnitDef {
  value: string
  label: string
  factor: number
}

export interface UnitCategory {
  value: string
  label: string
  units: UnitDef[]
}

export interface UnitConverterConfig extends BaseToolConfig {
  kind: 'unit-converter'
  categories: UnitCategory[]
}

export interface JsonFormatterConfig extends BaseToolConfig {
  kind: 'json-formatter'
}

export interface Base64Config extends BaseToolConfig {
  kind: 'base64'
}

export type ToolConfig =
  | UnitConverterConfig
  | JsonFormatterConfig
  | Base64Config
