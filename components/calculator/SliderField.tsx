'use client'

import {useTranslations} from 'next-intl'
import type {InputField} from '@/types'
import {Input} from '../ui/input'
import {Slider} from '../ui/slider'

interface Props {
  input: InputField
  label: string
  value: number
  onChange: (value: number) => void
}

export function SliderField({input, label, value, onChange}: Props) {
  const t = useTranslations('config')

  const min = input.min ?? 0
  const max = input.max ?? 100
  const step = input.step ?? 1

  function formatLegend(n: number): string {
    return n.toLocaleString('en-US')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={input.name} className="text-sm font-medium">
          {label}
          {input.unit && (
            <span className="ml-1 text-muted-foreground">
              ({t.has(input.unit) ? t(input.unit) : input.unit})
            </span>
          )}
        </label>
        <Input
          id={input.name}
          type="number"
          value={Number.isFinite(value) ? value : ''}
          onChange={e => {
            const raw = e.target.value
            if (raw === '') {
              onChange(0)
              return
            }
            const next = Number(raw)
            if (Number.isFinite(next)) onChange(next)
          }}
          min={min}
          max={max}
          step={step}
          className="h-8 w-32 text-right tabular-nums"
        />
      </div>

      <Slider
        value={[Number.isFinite(value) ? value : 0]}
        min={min}
        max={max}
        step={step}
        onValueChange={next => onChange(Array.isArray(next) ? next[0] : next)}
      />

      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{formatLegend(min)}</span>
        <span>{formatLegend(max)}</span>
      </div>

      {input.hint && (
        <p className="text-xs text-muted-foreground">{t(input.hint)}</p>
      )}
    </div>
  )
}
