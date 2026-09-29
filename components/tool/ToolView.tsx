import {assertNever} from '@/helpers'
import type {ToolConfig} from '@/types'
import {Base64View} from './Base64View'
import {BreakEvenCalculatorView} from './BreakEvenCalculatorView'
import {CaseConverterView} from './CaseConverterView'
import {CodeMinifierView} from './CodeMinifierView'
import {ColorContrastCheckerView} from './ColorContrastCheckerView'
import {ColorPickerView} from './ColorPickerView'
import {DiffCheckerView} from './DiffCheckerView'
import {GitignoreGeneratorView} from './GitignoreGeneratorView'
import {HashGeneratorView} from './HashGeneratorView'
import {ImageCompressorView} from './ImageCompressorView'
import {InvoiceGeneratorView} from './InvoiceGeneratorView'
import {InvoiceNumberGeneratorView} from './InvoiceNumberGeneratorView'
import {JsonFormatterView} from './JsonFormatterView'
import {JwtDecoderView} from './JwtDecoderView'
import {JwtEncoderView} from './JwtEncoderView'
import {LicenseGeneratorView} from './LicenseGeneratorView'
import {LoremIpsumView} from './LoremIpsumView'
import {MarkdownPreviewerView} from './MarkdownPreviewerView'
import {MetaTagGeneratorView} from './MetaTagGeneratorView'
import {PasswordGeneratorView} from './PasswordGeneratorView'
import {ProfitMarginCalculatorView} from './ProfitMarginCalculatorView'
import {QrCodeGeneratorView} from './QrCodeGeneratorView'
import {QuotationGeneratorView} from './QuotationGeneratorView'
import {SalarySlipGeneratorView} from './SalarySlipGeneratorView'
import {SqlFormatterMinifierView} from './SqlFormatterMinifierView'
import {TimestampConverterView} from './TimestampConverterView'
import {UnitConverterView} from './UnitConverterView'
import {UrlEncoderView} from './UrlEncoderView'
import {UtmBuilderView} from './UtmBuilderView'
import {UuidGeneratorView} from './UuidGeneratorView'
import {WordCounterView} from './WordCounterView'

interface Props {
  config: ToolConfig
}

export function ToolView({config}: Props) {
  switch (config.kind) {
    case 'unit-converter':
      return <UnitConverterView categories={config.categories} />
    case 'json-formatter':
      return <JsonFormatterView />
    case 'base64':
      return <Base64View />
    case 'word-counter':
      return <WordCounterView />
    case 'case-converter':
      return <CaseConverterView />
    case 'lorem-ipsum':
      return <LoremIpsumView />
    case 'diff-checker':
      return <DiffCheckerView />
    case 'uuid-generator':
      return <UuidGeneratorView />
    case 'hash-generator':
      return <HashGeneratorView />
    case 'url-encoder':
      return <UrlEncoderView />
    case 'timestamp-converter':
      return <TimestampConverterView />
    case 'jwt-decoder':
      return <JwtDecoderView />
    case 'jwt-encoder':
      return <JwtEncoderView />
    case 'password-generator':
      return <PasswordGeneratorView />
    case 'qr-code-generator':
      return <QrCodeGeneratorView />
    case 'image-compressor':
      return <ImageCompressorView />
    case 'invoice-generator':
      return <InvoiceGeneratorView />
    case 'invoice-number-generator':
      return <InvoiceNumberGeneratorView />
    case 'utm-builder':
      return <UtmBuilderView />
    case 'profit-margin-calculator':
      return <ProfitMarginCalculatorView />
    case 'break-even-calculator':
      return <BreakEvenCalculatorView />
    case 'quotation-generator':
      return <QuotationGeneratorView />
    case 'salary-slip-generator':
      return <SalarySlipGeneratorView />
    case 'license-generator':
      return <LicenseGeneratorView />
    case 'gitignore-generator':
      return <GitignoreGeneratorView />
    case 'markdown-previewer':
      return <MarkdownPreviewerView />
    case 'sql-formatter-minifier':
      return <SqlFormatterMinifierView />
    case 'code-minifier':
      return <CodeMinifierView />
    case 'color-picker':
      return <ColorPickerView />
    case 'color-contrast-checker':
      return <ColorContrastCheckerView />
    case 'meta-tag-generator':
      return <MetaTagGeneratorView />
    default:
      return assertNever(config)
  }
}
