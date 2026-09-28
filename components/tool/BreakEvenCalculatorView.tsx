'use client'

import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtInt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return Math.ceil(n).toLocaleString('en-US')
}

function fmtPercent(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return `${n.toFixed(2)}%`
}

const DEFAULTS = {
  fixedCosts: '10000',
  price: '50',
  variableCost: '30',
  expectedSales: '',
}

interface Result {
  contributionPerUnit: number
  contributionRatio: number
  breakEvenUnits: number
  breakEvenRevenue: number
  marginOfSafety: number | null
}

export function BreakEvenCalculatorView() {
  const t = useTranslations('config')

  const [fixedCosts, setFixedCosts] = useState(DEFAULTS.fixedCosts)
  const [price, setPrice] = useState(DEFAULTS.price)
  const [variableCost, setVariableCost] = useState(DEFAULTS.variableCost)
  const [expectedSales, setExpectedSales] = useState(DEFAULTS.expectedSales)

  const result = useMemo<Result | null>(() => {
    const F = Number(fixedCosts)
    const P = Number(price)
    const V = Number(variableCost)
    const S = Number(expectedSales)

    if (!Number.isFinite(F) || F <= 0) return null
    if (!Number.isFinite(P) || P <= 0) return null
    if (!Number.isFinite(V) || V < 0) return null
    if (P <= V) return null

    const contributionPerUnit = P - V
    const contributionRatio = (contributionPerUnit / P) * 100
    const breakEvenUnits = F / contributionPerUnit
    const breakEvenRevenue = breakEvenUnits * P

    let marginOfSafety: number | null = null
    if (expectedSales.trim() !== '' && Number.isFinite(S) && S > 0) {
      marginOfSafety = ((S - breakEvenUnits) / S) * 100
    }

    return {
      contributionPerUnit,
      contributionRatio,
      breakEvenUnits,
      breakEvenRevenue,
      marginOfSafety,
    }
  }, [fixedCosts, price, variableCost, expectedSales])

  const invalidPrice = useMemo(() => {
    const P = Number(price)
    const V = Number(variableCost)
    return Number.isFinite(P) && Number.isFinite(V) && P > 0 && P <= V
  }, [price, variableCost])

  function handleReset() {
    setFixedCosts(DEFAULTS.fixedCosts)
    setPrice(DEFAULTS.price)
    setVariableCost(DEFAULTS.variableCost)
    setExpectedSales(DEFAULTS.expectedSales)
  }

  return (
    <div className="space-y-6">
      {/* Inputs — 2 columns */}
      <div className="rounded-3xl border bg-card p-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="be-fixed" className="text-sm font-medium">
              {t('break-even-calculator.fixedCostsLabel')}
            </label>
            <Input
              id="be-fixed"
              type="number"
              min={0}
              value={fixedCosts}
              onChange={e => setFixedCosts(e.target.value)}
              className="tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              {t('break-even-calculator.fixedCostsHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="be-price" className="text-sm font-medium">
              {t('break-even-calculator.priceLabel')}
            </label>
            <Input
              id="be-price"
              type="number"
              min={0}
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              {t('break-even-calculator.priceHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="be-variable" className="text-sm font-medium">
              {t('break-even-calculator.variableCostLabel')}
            </label>
            <Input
              id="be-variable"
              type="number"
              min={0}
              value={variableCost}
              onChange={e => setVariableCost(e.target.value)}
              className="tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              {t('break-even-calculator.variableCostHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="be-expected" className="text-sm font-medium">
              {t('break-even-calculator.expectedSalesLabel')}
            </label>
            <Input
              id="be-expected"
              type="number"
              min={0}
              value={expectedSales}
              onChange={e => setExpectedSales(e.target.value)}
              placeholder={t('break-even-calculator.expectedSalesPlaceholder')}
              className="tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              {t('break-even-calculator.expectedSalesHint')}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="-ml-2 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {t('break-even-calculator.reset')}
          </Button>
        </div>

        {invalidPrice && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {t('break-even-calculator.invalidPrice')}
          </p>
        )}
      </div>

      {/* Results — как было */}
      {result && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">
              {t('break-even-calculator.breakEvenUnits')}
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
              {fmtInt(result.breakEvenUnits)}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {t('break-even-calculator.units')}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">
              {t('break-even-calculator.breakEvenRevenue')}
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
              {fmtMoney(result.breakEvenRevenue)}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {t('break-even-calculator.revenue')}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">
              {t('break-even-calculator.contributionMargin')}
            </div>
            <div className="mt-1 text-2xl font-bold text-blue-600 tabular-nums dark:text-blue-400">
              {fmtMoney(result.contributionPerUnit)}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {fmtPercent(result.contributionRatio)}{' '}
              {t('break-even-calculator.ratio')}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">
              {t('break-even-calculator.marginOfSafety')}
            </div>
            <div className="mt-1 text-2xl font-bold text-violet-600 tabular-nums dark:text-violet-400">
              {result.marginOfSafety !== null
                ? fmtPercent(result.marginOfSafety)
                : '—'}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {result.marginOfSafety !== null
                ? t('break-even-calculator.marginOfSafetyHint')
                : t('break-even-calculator.marginOfSafetyEmpty')}
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="rounded-3xl border bg-card p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {t('break-even-calculator.notePrefix')}
        </strong>{' '}
        {t('break-even-calculator.note')}
      </div>
    </div>
  )
}
