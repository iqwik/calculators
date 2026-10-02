import {assertNever} from '@/helpers'
import type {ToolConfig} from '@/types'
import {Base64ImageOptimizerView} from './Base64ImageOptimizerView'
import {Base64ToImageView} from './Base64ToImageView'
import {Base64View} from './Base64View'
import {BreakEvenCalculatorView} from './BreakEvenCalculatorView'
import {BulkImageResizerView} from './BulkImageResizerView'
import {CaseConverterView} from './CaseConverterView'
import {CodeMinifierView} from './CodeMinifierView'
import {ColorContrastCheckerView} from './ColorContrastCheckerView'
import {ColorPaletteExtractorView} from './ColorPaletteExtractorView'
import {ColorPickerView} from './ColorPickerView'
import {CssGeneratorView} from './CssGeneratorView'
import {DiffCheckerView} from './DiffCheckerView'
import {FaviconGeneratorView} from './FaviconGeneratorView'
import {GitignoreGeneratorView} from './GitignoreGeneratorView'
import {HashGeneratorView} from './HashGeneratorView'
import {ImageCompressorView} from './ImageCompressorView'
import {ImageConverterView} from './ImageConverterView'
import {ImagesToPdfView} from './ImagesToPdfView'
import {ImageWatermarkView} from './ImageWatermarkView'
import {InvoiceGeneratorView} from './InvoiceGeneratorView'
import {InvoiceNumberGeneratorView} from './InvoiceNumberGeneratorView'
import {JsonFormatterView} from './JsonFormatterView'
import {JwtDecoderView} from './JwtDecoderView'
import {JwtEncoderView} from './JwtEncoderView'
import {LicenseGeneratorView} from './LicenseGeneratorView'
import {LoremIpsumView} from './LoremIpsumView'
import {MarkdownPreviewerView} from './MarkdownPreviewerView'
import {MetaTagGeneratorView} from './MetaTagGeneratorView'
import {NumberToWordsView} from './NumberToWordsView'
import {PasswordGeneratorView} from './PasswordGeneratorView'
import {ProfitMarginCalculatorView} from './ProfitMarginCalculatorView'
import {QrCodeGeneratorView} from './QrCodeGeneratorView'
import {QuotationGeneratorView} from './QuotationGeneratorView'
import {RegexGeneratorView} from './RegexGeneratorView'
import {RegexTesterView} from './RegexTesterView'
import {SalarySlipGeneratorView} from './SalarySlipGeneratorView'
import {ScreenshotBeautifierView} from './ScreenshotBeautifierView'
import {SqlFormatterMinifierView} from './SqlFormatterMinifierView'
import {SvgToBase64View} from './SvgToBase64View'
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
    case 'image-converter':
      return <ImageConverterView />
    case 'bulk-image-resizer':
      return <BulkImageResizerView />
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
    case 'payslip-generator':
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
    case 'svg-to-base64':
      return <SvgToBase64View />
    case 'base64-to-image':
      return <Base64ToImageView />
    case 'regex-tester':
      return <RegexTesterView />
    case 'regex-generator':
      return <RegexGeneratorView />
    case 'css-generator':
      return <CssGeneratorView />
    case 'number-to-words':
      return <NumberToWordsView />
    case 'image-watermark':
      return <ImageWatermarkView />
    case 'color-palette-extractor':
      return <ColorPaletteExtractorView />
    case 'favicon-generator':
      return <FaviconGeneratorView />
    case 'base64-image-optimizer':
      return <Base64ImageOptimizerView />
    case 'images-to-pdf':
      return <ImagesToPdfView />
    case 'screenshot-beautifier':
      return <ScreenshotBeautifierView />
    default:
      return assertNever(config)
  }
}
