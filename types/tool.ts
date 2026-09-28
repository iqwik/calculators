import type {BaseConfig} from './common'

export type ToolKind =
  | 'unit-converter'
  | 'json-formatter'
  | 'base64'
  | 'word-counter'
  | 'case-converter'
  | 'lorem-ipsum'
  | 'diff-checker'
  | 'uuid-generator'
  | 'hash-generator'
  | 'url-encoder'
  | 'timestamp-converter'
  | 'jwt-decoder'
  | 'password-generator'
  | 'qr-code-generator'

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

export interface UnitConverterConfig extends BaseConfig {
  kind: 'unit-converter'
  categories: UnitCategory[]
}

export interface JsonFormatterConfig extends BaseConfig {
  kind: 'json-formatter'
}

export interface Base64Config extends BaseConfig {
  kind: 'base64'
}

export interface WordCounterConfig extends BaseConfig {
  kind: 'word-counter'
}

export interface CaseConverterConfig extends BaseConfig {
  kind: 'case-converter'
}

export interface LoremIpsumConfig extends BaseConfig {
  kind: 'lorem-ipsum'
}

export interface DiffCheckerConfig extends BaseConfig {
  kind: 'diff-checker'
}

export interface UuidGeneratorConfig extends BaseConfig {
  kind: 'uuid-generator'
}

export interface HashGeneratorConfig extends BaseConfig {
  kind: 'hash-generator'
}

export interface UrlEncoderConfig extends BaseConfig {
  kind: 'url-encoder'
}

export interface TimestampConverterConfig extends BaseConfig {
  kind: 'timestamp-converter'
}

export interface JwtDecoderConfig extends BaseConfig {
  kind: 'jwt-decoder'
}

export interface PasswordGeneratorConfig extends BaseConfig {
  kind: 'password-generator'
}

export interface QrCodeGeneratorConfig extends BaseConfig {
  kind: 'qr-code-generator'
}

export type ToolConfig =
  | UnitConverterConfig
  | JsonFormatterConfig
  | Base64Config
  | WordCounterConfig
  | CaseConverterConfig
  | LoremIpsumConfig
  | DiffCheckerConfig
  | UuidGeneratorConfig
  | HashGeneratorConfig
  | UrlEncoderConfig
  | TimestampConverterConfig
  | JwtDecoderConfig
  | PasswordGeneratorConfig
  | QrCodeGeneratorConfig
