'use client'

import {ArrowRightLeft, RotateCcw} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {HexColorPicker} from 'react-colorful'
import {contrastRatio, hexToRgb, rgbToHex} from '@/helpers/utils/colors'
import {CopyButton} from '../shared/CopyButton'
import {Button} from '../ui/button'

const DEFAULT_FG = '#1a1a1a'
const DEFAULT_BG = '#ffffff'

type Level = 'aaa' | 'aa' | 'fail'

interface CheckResult {
  ratio: number
  normalText: Level
  largeText: Level
  uiComponents: Level
}

function evaluateLevel(
  ratio: number,
  aaRequired: number,
  aaaRequired: number,
): Level {
  if (ratio >= aaaRequired) return 'aaa'
  if (ratio >= aaRequired) return 'aa'
  return 'fail'
}

function check(ratio: number): CheckResult {
  return {
    ratio,
    normalText: evaluateLevel(ratio, 4.5, 7),
    largeText: evaluateLevel(ratio, 3, 4.5),
    uiComponents: evaluateLevel(ratio, 3, 4.5), // UI = как large
  }
}

export function ColorContrastCheckerView() {
  const t = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [fg, setFg] = useState(DEFAULT_FG)
  const [bg, setBg] = useState(DEFAULT_BG)
  const [fgInput, setFgInput] = useState(DEFAULT_FG)
  const [bgInput, setBgInput] = useState(DEFAULT_BG)

  const fgRgb = useMemo(() => hexToRgb(fg) ?? {r: 0, g: 0, b: 0}, [fg])
  const bgRgb = useMemo(() => hexToRgb(bg) ?? {r: 255, g: 255, b: 255}, [bg])

  const ratio = useMemo(() => contrastRatio(fgRgb, bgRgb), [fgRgb, bgRgb])

  const result = useMemo(() => check(ratio), [ratio])

  function handleFgChange(value: string) {
    setFgInput(value)
    const parsed = hexToRgb(value)
    if (parsed) setFg(rgbToHex(parsed))
  }

  function handleBgChange(value: string) {
    setBgInput(value)
    const parsed = hexToRgb(value)
    if (parsed) setBg(rgbToHex(parsed))
  }

  function handleSwap() {
    const prevFg = fg
    const prevBg = bg
    const prevFgInput = fgInput
    const prevBgInput = bgInput
    setFg(prevBg)
    setBg(prevFg)
    setFgInput(prevBgInput)
    setBgInput(prevFgInput)
  }

  function handleReset() {
    setFg(DEFAULT_FG)
    setBg(DEFAULT_BG)
    setFgInput(DEFAULT_FG)
    setBgInput(DEFAULT_BG)
  }

  const ratioFormatted = `${ratio.toFixed(2)}:1`

  return (
    <div className="space-y-5">
      {/* Colors */}
      <div className="grid gap-5 rounded-2xl border bg-card p-5 md:grid-cols-2">
        {/* Foreground */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
              {t('color-contrast-checker.foreground')}
            </span>
            <CopyButton
              getValue={() => fg}
              showLabel={false}
              className="h-7 w-7 p-0"
            />
          </div>
          <HexColorPicker
            style={{width: '100%'}}
            color={fg}
            onChange={handleFgChange}
          />
          <input
            value={fgInput}
            onChange={e => handleFgChange(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30"
            spellCheck={false}
          />
        </div>

        {/* Background */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
              {t('color-contrast-checker.background')}
            </span>
            <CopyButton
              getValue={() => bg}
              showLabel={false}
              className="h-7 w-7 p-0"
            />
          </div>
          <HexColorPicker
            style={{width: '100%'}}
            color={bg}
            onChange={handleBgChange}
          />
          <input
            value={bgInput}
            onChange={e => handleBgChange(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleSwap}>
          <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
          {t('color-contrast-checker.swap')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-destructive hover:text-destructive"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          {tGlobal('reset')}
        </Button>
      </div>

      {/* Result cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultCard
          label={t('color-contrast-checker.ratio')}
          value={ratioFormatted}
          level="neutral"
        />
        <ResultCard
          label={t('color-contrast-checker.normalText')}
          value={t(`color-contrast-checker.levels.${result.normalText}`)}
          level={result.normalText}
          hint={t('color-contrast-checker.thresholdNormal')}
        />
        <ResultCard
          label={t('color-contrast-checker.largeText')}
          value={t(`color-contrast-checker.levels.${result.largeText}`)}
          level={result.largeText}
          hint={t('color-contrast-checker.thresholdLarge')}
        />
        <ResultCard
          label={t('color-contrast-checker.uiComponents')}
          value={t(`color-contrast-checker.levels.${result.uiComponents}`)}
          level={result.uiComponents}
          hint={t('color-contrast-checker.thresholdUi')}
        />
      </div>

      {/* Preview */}
      <div className="space-y-3 rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">
          {t('color-contrast-checker.previewTitle')}
        </h3>
        <div
          className="space-y-3 rounded-xl border p-6"
          style={{background: bg, color: fg}}
        >
          <p className="text-2xl font-bold">
            {t('color-contrast-checker.previewLarge')}
          </p>
          <p className="text-base">
            {t('color-contrast-checker.previewNormal')}
          </p>
          <p className="text-sm">{t('color-contrast-checker.previewSmall')}</p>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-3xl border bg-card p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">
          {t('color-contrast-checker.notePrefix')}
        </strong>{' '}
        {t('color-contrast-checker.note')}
      </div>
    </div>
  )
}

interface ResultCardProps {
  label: string
  value: string
  level: Level | 'neutral'
  hint?: string
}

function ResultCard({label, value, level, hint}: ResultCardProps) {
  const colors: Record<Level | 'neutral', string> = {
    aaa: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    aa: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    fail: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
    neutral: 'border-border bg-card',
  }

  return (
    <div className={`rounded-2xl border p-4 ${colors[level]}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
      {hint && (
        <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
      )}
    </div>
  )
}
