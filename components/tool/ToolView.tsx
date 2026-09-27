import type {ToolConfig} from '@/types'
import {Base64View} from './Base64View'
import {JsonFormatterView} from './JsonFormatterView'
import {UnitConverterView} from './UnitConverterView'

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
  }
}
