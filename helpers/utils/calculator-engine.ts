import type {
  CalculationOutput,
  CalculatorConfig,
  ResultRange,
  Values,
} from '@/types'

export interface ValidationResult {
  ok: boolean
  errors: Record<string, string>
}

export function validateInputs(
  config: CalculatorConfig,
  values: Values,
): ValidationResult {
  const errors: Record<string, string> = {}

  for (const input of config.inputs) {
    const value = values[input.name]

    if (value === '' || value === undefined || value === null) {
      errors[input.name] = 'Заполните поле'
      continue
    }

    if (input.type === 'number') {
      const num = Number(value)
      if (Number.isNaN(num)) {
        errors[input.name] = 'Введите число'
      } else if (input.min !== undefined && num < input.min) {
        errors[input.name] = `Минимум: ${input.min}`
      } else if (input.max !== undefined && num > input.max) {
        errors[input.name] = `Максимум: ${input.max}`
      }
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  }
}

export interface CalculationResult {
  ok: boolean
  output?: CalculationOutput
  range?: ResultRange | null
  error?: string
}

export function getRange(
  value: number,
  ranges: ResultRange[] | undefined,
): ResultRange | null {
  if (!ranges || ranges.length === 0) return null
  return ranges.find(r => value < r.max) ?? ranges[ranges.length - 1]
}

export function runCalculation(
  config: CalculatorConfig,
  values: Values,
): CalculationResult {
  const validation = validateInputs(config, values)
  if (!validation.ok) {
    return {ok: false, error: 'Проверьте поля формы'}
  }

  try {
    const output = config.calculate(values)
    const range =
      output.raw !== undefined ? getRange(output.raw, config.ranges) : null
    return {ok: true, output, range}
  } catch (e) {
    console.error('Calculation error:', e)
    return {ok: false, error: 'Ошибка расчёта'}
  }
}
