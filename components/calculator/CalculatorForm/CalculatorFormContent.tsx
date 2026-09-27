'use client'

import {useTranslations} from 'next-intl'
import {SyntheticEvent, useCallback, useState} from 'react'
import {Button, Input} from '@/components/ui'
import {type CalculationResult, runCalculation, validateInputs} from '@/helpers'
import type {CalculatorConfig, Values} from '@/types'
import {CalculatorResult} from '../CalculatorResult'

export function CalculatorFormContent({config}: {config: CalculatorConfig}) {
  const t = useTranslations('config')
  const tUi = useTranslations('calculator')

  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(config.inputs.map(i => [i.name, i.defaultValue ?? ''])),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<CalculationResult | null>(null)

  const handleChange = useCallback((name: string, value: string) => {
    setValues(prev => ({...prev, [name]: value}))
    setErrors(prev => {
      if (!prev[name]) return prev
      const next = {...prev}
      delete next[name]
      return next
    })
  }, [])

  const handleSubmit = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      const validation = validateInputs(config, values)
      setErrors(validation.errors)
      if (!validation.ok) {
        setResult(null)
        return
      }
      setResult(runCalculation(config, values))
    },
    [config, values],
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config.inputs.map(input => (
        <Input
          key={input.name}
          {...input}
          label={t(input.label)}
          hint={input.hint ? t(input.hint) : undefined}
          options={input.options?.map(o => ({...o, label: t(o.label)}))}
          value={values[input.name] ?? ''}
          error={errors[input.name]}
          onChange={v => handleChange(input.name, v)}
        />
      ))}

      <Button type="submit">{tUi('calculate')}</Button>

      {result?.ok && result.output && (
        <CalculatorResult config={config} result={result} />
      )}

      {result && !result.ok && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {tUi('calcError')}
        </div>
      )}
    </form>
  )
}
