import {
  BaseConfig,
  InputField,
  OperationResult,
  ResultRange,
  Values,
} from './common'

export interface CalcContext {
  /** current Locale UI: 'en', 'ru' e.g. */
  locale: string
}

export interface CalculatorConfig extends BaseConfig {
  inputs: InputField[]
  calculate: (values: Values, ctx: CalcContext) => OperationResult
  resultLabel: string
  resultUnit?: string
  ranges?: ResultRange[]
}
