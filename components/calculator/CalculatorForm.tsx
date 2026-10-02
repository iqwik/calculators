'use client'

import {useLocale, useTranslations} from 'next-intl'
import {SyntheticEvent, useEffect, useMemo, useState} from 'react'
import {getCalculatorBySlug} from '@/data'
import type {OperationResult, ResultRange, Values} from '@/types'
import {Button} from '../ui/button'
import {DatePicker} from '../ui/date-picker'
import {Input} from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {SliderField} from './SliderField'

interface Props {
  slug: string
}

const RANGE_COLORS: Record<ResultRange['color'], string> = {
  blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  green:
    'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
  orange:
    'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
  red: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
  gray: 'bg-muted text-muted-foreground border-border',
}

function findRange(
  ranges: ResultRange[] | undefined,
  raw: number | undefined,
): ResultRange | undefined {
  if (!ranges || raw === undefined) return undefined
  return ranges.find(r => raw < r.max)
}

export function CalculatorForm({slug}: Props) {
  const locale = useLocale()
  const tConfig = useTranslations('config')
  const tGlobal = useTranslations('global')

  const calc = useMemo(() => getCalculatorBySlug(slug), [slug])

  const [values, setValues] = useState<Values>(() => {
    if (!calc) return {}
    const init: Values = {}
    for (const input of calc.inputs) {
      init[input.name] = input.defaultValue ?? ''
    }
    return init
  })

  const [result, setResult] = useState<OperationResult | null>(null)

  const hasSliders = useMemo(
    () => calc?.inputs.some(i => i.type === 'slider') ?? false,
    [calc],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: calc and locale are stable
  useEffect(() => {
    if (hasSliders && calc) {
      setResult(calc.calculate(values, {locale}))
    }
  }, [values, hasSliders])

  if (!calc) return null

  function handleChange(name: string, value: string | number) {
    setValues(prev => ({...prev, [name]: value}))
  }

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault()
    if (!calc) return
    setResult(calc.calculate(values, {locale}))
  }

  function handleReset() {
    if (!calc) return
    const init: Values = {}
    for (const input of calc.inputs) {
      init[input.name] = input.defaultValue ?? ''
    }
    setValues(init)
    setResult(null)
  }

  const range = result ? findRange(calc.ranges, result.raw) : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {calc.inputs.map(input => {
        if (input.type === 'slider') {
          return (
            <SliderField
              key={input.name}
              input={input}
              label={tConfig(input.label)}
              value={Number(values[input.name]) || 0}
              onChange={v => handleChange(input.name, v)}
            />
          )
        }

        return (
          <div key={input.name} className="space-y-1.5">
            <label htmlFor={input.name} className="text-sm font-medium">
              {tConfig(input.label)}
              {input.unit && (
                <span className="ml-1 text-muted-foreground">
                  ({tConfig.has(input.unit) ? tConfig(input.unit) : input.unit})
                </span>
              )}
            </label>

            {input.type === 'select' && input.options ? (
              <Select
                items={input.options.map(opt => ({
                  value: opt.value,
                  label: tConfig(opt.label),
                }))}
                value={String(values[input.name] ?? '')}
                onValueChange={value => handleChange(input.name, value ?? '')}
              >
                <SelectTrigger id={input.name} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {input.options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {tConfig(opt.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : input.type === 'date' ? (
              <DatePicker
                id={input.name}
                value={String(values[input.name] ?? '')}
                onChange={v => handleChange(input.name, v)}
              />
            ) : (
              <Input
                id={input.name}
                type={input.type}
                value={String(values[input.name] ?? '')}
                onChange={e => handleChange(input.name, e.target.value)}
                min={input.min}
                max={input.max}
                step={input.step}
                placeholder={input.placeholder}
              />
            )}

            {input.hint && (
              <p className="text-xs text-muted-foreground">
                {tConfig(input.hint)}
              </p>
            )}
          </div>
        )
      })}

      <div className="flex gap-2 pt-2">
        {!hasSliders && <Button type="submit">{tGlobal('calculate')}</Button>}
        <Button type="button" variant="outline" onClick={handleReset}>
          {tGlobal('reset')}
        </Button>
      </div>

      {result && (
        <div className="mt-6 rounded-xl border bg-muted/30 p-5">
          <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {tConfig(calc.resultLabel)}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">
              {typeof result.value === 'string' && tConfig.has(result.value)
                ? tConfig(result.value, result.params ?? {})
                : result.value}
            </span>
            {calc.resultUnit && (
              <span className="text-base text-muted-foreground">
                {tConfig(calc.resultUnit)}
              </span>
            )}
          </div>

          {range && (
            <div
              className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${RANGE_COLORS[range.color]}`}
            >
              {tConfig(range.label)}
            </div>
          )}

          {result.secondary && result.secondary.length > 0 && (
            <dl className="mt-4 grid gap-2 text-sm">
              {result.secondary.map(item => (
                <div key={item.label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {tConfig(item.label)}
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {tConfig.has(item.value)
                      ? tConfig(item.value, item.params ?? {})
                      : item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </form>
  )
}
