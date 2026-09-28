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

function fmtPercent(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return `${n.toFixed(2)}%`
}

const DEFAULTS = {
  costA: '800',
  priceA: '1200',
  costB: '800',
  targetMargin: '35',
  costC: '800',
  markup: '50',
}

export function ProfitMarginCalculatorView() {
  const t = useTranslations('config')

  const [costA, setCostA] = useState(DEFAULTS.costA)
  const [priceA, setPriceA] = useState(DEFAULTS.priceA)

  const [costB, setCostB] = useState(DEFAULTS.costB)
  const [targetMargin, setTargetMargin] = useState(DEFAULTS.targetMargin)

  const [costC, setCostC] = useState(DEFAULTS.costC)
  const [markup, setMarkup] = useState(DEFAULTS.markup)

  // Block 1: cost + selling price → profit, margin, markup
  const block1 = useMemo(() => {
    const C = Number(costA)
    const P = Number(priceA)
    if (!Number.isFinite(C) || !Number.isFinite(P) || P <= 0) return null

    const profit = P - C
    const margin = (profit / P) * 100
    const markupPct = C > 0 ? (profit / C) * 100 : 0
    const per100 = (profit / P) * 100

    return {profit, margin, markup: markupPct, per100}
  }, [costA, priceA])

  // Block 2: cost + target margin → required price
  const block2 = useMemo(() => {
    const C = Number(costB)
    const M = Number(targetMargin)
    if (!Number.isFinite(C) || C <= 0) return null
    if (!Number.isFinite(M) || M <= 0 || M >= 100) return null

    const price = C / (1 - M / 100)
    return {price}
  }, [costB, targetMargin])

  // Block 3: cost + markup → required price + equivalent margin
  const block3 = useMemo(() => {
    const C = Number(costC)
    const K = Number(markup)
    if (!Number.isFinite(C) || C <= 0) return null
    if (!Number.isFinite(K) || K < 0) return null

    const price = C * (1 + K / 100)
    const profit = price - C
    const equivalentMargin = price > 0 ? (profit / price) * 100 : 0
    return {price, equivalentMargin}
  }, [costC, markup])

  function handleReset() {
    setCostA(DEFAULTS.costA)
    setPriceA(DEFAULTS.priceA)
    setCostB(DEFAULTS.costB)
    setTargetMargin(DEFAULTS.targetMargin)
    setCostC(DEFAULTS.costC)
    setMarkup(DEFAULTS.markup)
  }

  return (
    <div className="space-y-6">
      {/* Block 1: Cost & Selling Price */}
      <div className="rounded-3xl border bg-card p-6">
        <div className="mb-3 text-sm font-semibold">
          {t('profit-margin-calculator.block1.title')}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="pm-cost-a"
              className="text-sm font-medium text-muted-foreground"
            >
              {t('profit-margin-calculator.block1.costLabel')}
            </label>
            <Input
              id="pm-cost-a"
              type="number"
              value={costA}
              onChange={e => setCostA(e.target.value)}
              className="tabular-nums"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="pm-price-a"
              className="text-sm font-medium text-muted-foreground"
            >
              {t('profit-margin-calculator.block1.priceLabel')}
            </label>
            <Input
              id="pm-price-a"
              type="number"
              value={priceA}
              onChange={e => setPriceA(e.target.value)}
              className="tabular-nums"
            />
          </div>
        </div>

        {block1 && (
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="rounded-2xl border bg-background p-3">
              <div className="text-xs text-muted-foreground">
                {t('profit-margin-calculator.block1.grossProfit')}
              </div>
              <div className="text-lg font-bold tabular-nums">
                {fmtMoney(block1.profit)}
              </div>
            </div>
            <div className="rounded-2xl border bg-background p-3">
              <div className="text-xs text-muted-foreground">
                {t('profit-margin-calculator.block1.margin')}
              </div>
              <div className="text-lg font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                {fmtPercent(block1.margin)}
              </div>
            </div>
            <div className="rounded-2xl border bg-background p-3">
              <div className="text-xs text-muted-foreground">
                {t('profit-margin-calculator.block1.markup')}
              </div>
              <div className="text-lg font-bold text-blue-600 tabular-nums dark:text-blue-400">
                {fmtPercent(block1.markup)}
              </div>
            </div>
            <div className="rounded-2xl border bg-background p-3">
              <div className="text-xs text-muted-foreground">
                {t('profit-margin-calculator.block1.per100')}
              </div>
              <div className="text-lg font-bold tabular-nums">
                {fmtMoney(block1.per100)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block 2 + Block 3 side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Block 2: Cost + Target Margin */}
        <div className="rounded-3xl border bg-card p-6">
          <div className="mb-3 text-sm font-semibold">
            {t('profit-margin-calculator.block2.title')}
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="pm-cost-b"
                className="text-sm font-medium text-muted-foreground"
              >
                {t('profit-margin-calculator.block2.costLabel')}
              </label>
              <Input
                id="pm-cost-b"
                type="number"
                value={costB}
                onChange={e => setCostB(e.target.value)}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="pm-target-margin"
                className="text-sm font-medium text-muted-foreground"
              >
                {t('profit-margin-calculator.block2.targetMarginLabel')}
              </label>
              <Input
                id="pm-target-margin"
                type="number"
                value={targetMargin}
                onChange={e => setTargetMargin(e.target.value)}
                className="tabular-nums"
              />
            </div>
          </div>

          {block2 && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="text-xs text-emerald-700 dark:text-emerald-400">
                {t('profit-margin-calculator.block2.resultLabel')}
              </div>
              <div className="text-3xl font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
                {fmtMoney(block2.price)}
              </div>
            </div>
          )}
        </div>

        {/* Block 3: Cost + Markup */}
        <div className="rounded-3xl border bg-card p-6">
          <div className="mb-3 text-sm font-semibold">
            {t('profit-margin-calculator.block3.title')}
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="pm-cost-c"
                className="text-sm font-medium text-muted-foreground"
              >
                {t('profit-margin-calculator.block3.costLabel')}
              </label>
              <Input
                id="pm-cost-c"
                type="number"
                value={costC}
                onChange={e => setCostC(e.target.value)}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="pm-markup"
                className="text-sm font-medium text-muted-foreground"
              >
                {t('profit-margin-calculator.block3.markupLabel')}
              </label>
              <Input
                id="pm-markup"
                type="number"
                value={markup}
                onChange={e => setMarkup(e.target.value)}
                className="tabular-nums"
              />
            </div>
          </div>

          {block3 && (
            <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="text-xs text-blue-700 dark:text-blue-400">
                {t('profit-margin-calculator.block3.resultLabel')}
              </div>
              <div className="text-3xl font-bold text-blue-700 tabular-nums dark:text-blue-400">
                {fmtMoney(block3.price)}
              </div>
              <div className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                {t('profit-margin-calculator.block3.equivalentMargin', {
                  value: fmtPercent(block3.equivalentMargin),
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t('profit-margin-calculator.reset')}
        </Button>
      </div>

      {/* Note */}
      <div className="rounded-3xl border bg-card p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {t('profit-margin-calculator.notePrefix')}
        </strong>{' '}
        {t('profit-margin-calculator.note')}
      </div>
    </div>
  )
}
