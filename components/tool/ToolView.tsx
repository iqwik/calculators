import {assertNever} from '@/helpers'
import type {ToolConfig} from '@/types'
import {Base64View} from './Base64View'
import {CaseConverterView} from './CaseConverterView'
import {DiffCheckerView} from './DiffCheckerView'
import {HashGeneratorView} from './HashGeneratorView'
import {JsonFormatterView} from './JsonFormatterView'
import {JwtDecoderView} from './JwtDecoderView'
import {LoremIpsumView} from './LoremIpsumView'
import {PasswordGeneratorView} from './PasswordGeneratorView'
import {QrCodeGeneratorView} from './QrCodeGeneratorView'
import {TimestampConverterView} from './TimestampConverterView'
import {UnitConverterView} from './UnitConverterView'
import {UrlEncoderView} from './UrlEncoderView'
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
    case 'password-generator':
      return <PasswordGeneratorView />
    case 'qr-code-generator':
      return <QrCodeGeneratorView />
    default:
      return assertNever(config)
  }
}
