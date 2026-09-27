'use client'

import {ArrowLeftRight} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import type {UnitCategory} from '@/types'
import {Button} from '../ui/button'

interface Props {
  categories: UnitCategory[]
}

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value

  let celsius = value
  if (from === 'f') celsius = (value - 32) * (5 / 9)
  if (from === 'k') celsius = value - 273.15

  if (to === 'c') return celsius
  if (to === 'f') return celsius * (9 / 5) + 32
  if (to === 'k') return celsius + 273.15
  return celsius
}

function convert(
  value: number,
  fromFactor: number,
  toFactor: number,
  category: string,
  fromUnit: string,
  toUnit: string,
): number {
  if (category === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit)
  }
  return (value * fromFactor) / toFactor
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs !== 0 && (abs < 0.0001 || abs >= 1e12)) {
    return n.toExponential(6)
  }
  return n.toLocaleString('en-US', {maximumFractionDigits: 6})
}

export function UnitConverterView({categories}: Props) {
  const t = useTranslations('config')

  const [categoryValue, setCategoryValue] = useState(categories[0].value)
  const category = useMemo(
    () => categories.find(c => c.value === categoryValue) ?? categories[0],
    [categories, categoryValue],
  )

  const [fromUnit, setFromUnit] = useState(category.units[0].value)
  const [toUnit, setToUnit] = useState(
    category.units[1]?.value ?? category.units[0].value,
  )
  const [input, setInput] = useState('1')

  const value = Number(input.replace(',', '.'))
  const safeValue = Number.isFinite(value) ? value : 0
  const from =
    category.units.find(u => u.value === fromUnit) ?? category.units[0]
  const to = category.units.find(u => u.value === toUnit) ?? category.units[0]

  const result = convert(
    safeValue,
    from.factor,
    to.factor,
    category.value,
    from.value,
    to.value,
  )

  const allResults = category.units.map(u => ({
    unit: u,
    value: convert(
      safeValue,
      from.factor,
      u.factor,
      category.value,
      from.value,
      u.value,
    ),
  }))

  function handleCategoryChange(v: string) {
    const next = categories.find(c => c.value === v) ?? categories[0]
    setCategoryValue(v)
    setFromUnit(next.units[0].value)
    setToUnit(next.units[1]?.value ?? next.units[0].value)
  }

  function handleSwap() {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <Button
            key={c.value}
            type="button"
            variant={c.value === categoryValue ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(c.value)}
          >
            {t(c.label)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-end gap-4 rounded-xl border bg-card p-5 md:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          <label
            htmlFor="unit-from-value"
            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {t('unit-converter.from')}
          </label>
          <input
            id="unit-from-value"
            type="number"
            inputMode="decimal"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full border-b-2 border-border bg-transparent py-2 text-3xl font-bold outline-none focus:border-primary"
            placeholder="0"
          />
          <select
            aria-label={t('unit-converter.fromUnit')}
            value={fromUnit}
            onChange={e => setFromUnit(e.target.value)}
            className="h-10 w-full rounded-md border bg-transparent px-3 text-sm"
          >
            {category.units.map(u => (
              <option key={u.value} value={u.value}>
                {t(u.label)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center pb-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            aria-label={t('unit-converter.swap')}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="unit-to-value"
            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {t('unit-converter.to')}
          </label>
          <p
            id="unit-to-value"
            aria-live="polite"
            className="w-full overflow-hidden border-b-2 border-transparent py-2 text-3xl font-bold text-ellipsis whitespace-nowrap text-primary"
          >
            {formatNumber(result)}
          </p>
          <select
            aria-label={t('unit-converter.toUnit')}
            value={toUnit}
            onChange={e => setToUnit(e.target.value)}
            className="h-10 w-full rounded-md border bg-transparent px-3 text-sm"
          >
            {category.units.map(u => (
              <option key={u.value} value={u.value}>
                {t(u.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
          {t('unit-converter.allConversions')}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {allResults.map(({unit, value: v}) => {
            const active = unit.value === toUnit
            return (
              <button
                key={unit.value}
                type="button"
                onClick={() => setToUnit(unit.value)}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                  active
                    ? 'border-primary/40 bg-primary/10 shadow-sm ring-1 ring-primary/20'
                    : 'border-border bg-card hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md'
                }`}
              >
                <span
                  className={`w-full truncate text-lg font-bold ${
                    active ? 'text-primary' : ''
                  }`}
                >
                  {formatNumber(v)}
                </span>
                <span className="mt-1.5 text-xs text-muted-foreground">
                  {t(unit.label)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
