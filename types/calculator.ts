import {
  BaseConfig,
  InputField,
  OperationResult,
  ResultRange,
  Values,
} from './common'

export interface CalculatorConfig extends BaseConfig {
  inputs: InputField[]
  calculate: (values: Values) => OperationResult
  resultLabel: string
  resultUnit?: string
  ranges?: ResultRange[]
}
