'use client'

import {useTranslations} from 'next-intl'
import {type CalculationResult, formatNumber} from '@/helpers'
import type {CalculatorConfig} from '@/types/calculator'

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-900 border-blue-200',
  green: 'bg-green-50 text-green-900 border-green-200',
  orange: 'bg-orange-50 text-orange-900 border-orange-200',
  red: 'bg-red-50 text-red-900 border-red-200',
  gray: 'bg-gray-50 text-gray-900 border-gray-200',
}

interface CalculatorResultProps {
  config: CalculatorConfig
  result: CalculationResult
}

export function CalculatorResult({config, result}: CalculatorResultProps) {
  const t = useTranslations('config')

  if (!result.ok || !result.output) return null

  const color = result.range?.color ?? 'gray'
  const isNumeric = typeof result.output.value === 'number'

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="text-sm opacity-70">{t(config.resultLabel)}</div>
      <div className="mt-1 text-4xl font-bold">
        {isNumeric
          ? formatNumber(result.output.value as number)
          : result.output.value}
        {config.resultUnit && (
          <span className="ml-2 text-lg font-normal">
            {t(config.resultUnit)}
          </span>
        )}
      </div>

      {result.range && (
        <div className="mt-2 text-sm font-medium">{t(result.range.label)}</div>
      )}

      {result.output.secondary && result.output.secondary.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-current/10 pt-4">
          {result.output.secondary.map(item => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="opacity-70">{t(item.label)}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
