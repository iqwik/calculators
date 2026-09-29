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
  | 'jwt-encoder'
  | 'password-generator'
  | 'qr-code-generator'
  | 'image-compressor'
  | 'invoice-generator'
  | 'invoice-number-generator'
  | 'utm-builder'
  | 'profit-margin-calculator'
  | 'break-even-calculator'
  | 'quotation-generator'
  | 'payslip-generator'
  | 'license-generator'
  | 'gitignore-generator'
  | 'markdown-previewer'
  | 'sql-formatter-minifier'
  | 'code-minifier'
  | 'color-picker'
  | 'color-contrast-checker'
  | 'meta-tag-generator'
  | 'svg-to-base64'
  | 'base64-to-image'
  | 'regex-tester'
  | 'regex-generator'
  | 'css-generator'
  | 'number-to-words'

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

export interface JwtEncoderConfig extends BaseConfig {
  kind: 'jwt-encoder'
}

export interface PasswordGeneratorConfig extends BaseConfig {
  kind: 'password-generator'
}

export interface QrCodeGeneratorConfig extends BaseConfig {
  kind: 'qr-code-generator'
}

export interface ImageCompressorConfig extends BaseConfig {
  kind: 'image-compressor'
}

export interface InvoiceGeneratorConfig extends BaseConfig {
  kind: 'invoice-generator'
}

export interface InvoiceNumberGeneratorConfig extends BaseConfig {
  kind: 'invoice-number-generator'
}

export interface UtmBuilderConfig extends BaseConfig {
  kind: 'utm-builder'
}

export interface ProfitMarginCalculatorConfig extends BaseConfig {
  kind: 'profit-margin-calculator'
}

export interface BreakEvenCalculatorConfig extends BaseConfig {
  kind: 'break-even-calculator'
}

export interface QuotationGeneratorConfig extends BaseConfig {
  kind: 'quotation-generator'
}

export interface SalarySlipGeneratorConfig extends BaseConfig {
  kind: 'payslip-generator'
}

export interface LicenseGeneratorConfig extends BaseConfig {
  kind: 'license-generator'
}

export interface GitignoreGeneratorConfig extends BaseConfig {
  kind: 'gitignore-generator'
}

export interface MarkdownPreviewerConfig extends BaseConfig {
  kind: 'markdown-previewer'
}

export interface SqlFormatterMinifierConfig extends BaseConfig {
  kind: 'sql-formatter-minifier'
}

export interface CodeMinifierConfig extends BaseConfig {
  kind: 'code-minifier'
}

export interface ColorPickerConfig extends BaseConfig {
  kind: 'color-picker'
}

export interface ColorContrastCheckerConfig extends BaseConfig {
  kind: 'color-contrast-checker'
}

export interface MetaTagGeneratorConfig extends BaseConfig {
  kind: 'meta-tag-generator'
}

export interface SvgToBase64Config extends BaseConfig {
  kind: 'svg-to-base64'
}

export interface Base64ToImageConfig extends BaseConfig {
  kind: 'base64-to-image'
}

export interface RegexTesterConfig extends BaseConfig {
  kind: 'regex-tester'
}

export interface RegexGeneratorConfig extends BaseConfig {
  kind: 'regex-generator'
}

export interface CssGeneratorConfig extends BaseConfig {
  kind: 'css-generator'
}

export interface NumberToWordsConfig extends BaseConfig {
  kind: 'number-to-words'
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
  | JwtEncoderConfig
  | PasswordGeneratorConfig
  | QrCodeGeneratorConfig
  | ImageCompressorConfig
  | InvoiceGeneratorConfig
  | InvoiceNumberGeneratorConfig
  | UtmBuilderConfig
  | ProfitMarginCalculatorConfig
  | BreakEvenCalculatorConfig
  | QuotationGeneratorConfig
  | SalarySlipGeneratorConfig
  | LicenseGeneratorConfig
  | GitignoreGeneratorConfig
  | MarkdownPreviewerConfig
  | SqlFormatterMinifierConfig
  | CodeMinifierConfig
  | ColorPickerConfig
  | ColorContrastCheckerConfig
  | MetaTagGeneratorConfig
  | SvgToBase64Config
  | Base64ToImageConfig
  | RegexTesterConfig
  | RegexGeneratorConfig
  | CssGeneratorConfig
  | NumberToWordsConfig
