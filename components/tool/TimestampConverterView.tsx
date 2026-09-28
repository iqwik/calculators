'use client'

import {Clock, List, RefreshCw} from 'lucide-react'
import {useLocale, useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'
import {CopyButton} from '../shared/CopyButton'
import {Button} from '../ui/button'
import {SegmentedControl} from '../ui/segmented-control'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Africa/Johannesburg',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
]

function parseInput(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const n = Number(trimmed)
  if (Number.isFinite(n)) {
    // auto-detect: >1e12 → ms, иначе секунды
    const ms = n > 1e12 ? n : n * 1000
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const d = new Date(trimmed)
  return Number.isNaN(d.getTime()) ? null : d
}

function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime()
  const abs = Math.abs(diff)
  const sec = Math.floor(abs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)

  const suffix = diff >= 0 ? 'ago' : 'from now'
  if (sec < 60) return `${sec} seconds ${suffix}`
  if (min < 60) return `${min} minutes ${suffix}`
  if (hr < 24) return `${hr} hours ${suffix}`
  return `${day} days ${suffix}`
}

function formatInTimezone(d: Date, tz: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d)
}

interface BatchResult {
  input: string
  output: string
  relative: string
  error: boolean
}

function convertBatchLine(line: string, locale: string): BatchResult | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  const d = parseInput(trimmed)
  if (!d) {
    return {input: trimmed, output: 'Invalid', relative: '', error: true}
  }

  return {
    input: trimmed,
    output: d.toISOString(),
    relative: relativeTime(d),
    error: false,
  }
}

export function TimestampConverterView() {
  const tConfig = useTranslations('config')
  const tGlobal = useTranslations('global')
  const locale = useLocale()

  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const [input, setInput] = useState('')
  const [batch, setBatch] = useState('')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const nowSeconds = Math.floor(now.getTime() / 1000)
  const date = parseInput(input)

  function handleRefresh() {
    setInput(String(nowSeconds))
  }

  function handleShift(minutes: number) {
    const base = date ?? now
    const shifted = new Date(base.getTime() + minutes * 60 * 1000)
    setInput(String(Math.floor(shifted.getTime() / 1000)))
  }

  function handleUseAsInput() {
    setInput(String(nowSeconds))
  }

  const batchResults =
    mode === 'batch' && batch
      ? batch
          .split('\n')
          .map(line => convertBatchLine(line, locale))
          .filter((r): r is BatchResult => r !== null)
      : []

  return (
    <div className="space-y-6">
      {/* Current time card */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card p-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {tConfig('timestamp-converter.currentTime')}
        </div>
        <div className="font-mono">
          {now.toISOString()}{' '}
          <span className="text-muted-foreground">({nowSeconds}s)</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseAsInput}
        >
          {tConfig('timestamp-converter.useAsInput')}
        </Button>
      </div>

      {/* Mode switcher centered */}
      <div className="flex justify-center">
        <SegmentedControl
          name="ts-mode"
          value={mode}
          onChange={setMode}
          options={[
            {value: 'single', label: tConfig('timestamp-converter.single')},
            {value: 'batch', label: tConfig('timestamp-converter.batch')},
          ]}
        />
      </div>

      {mode === 'single' ? (
        <div className="rounded-3xl border bg-card p-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={tConfig('timestamp-converter.inputPlaceholder')}
              className="h-10 flex-1 rounded-xl border bg-background px-4 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30"
              spellCheck={false}
            />
            <Button
              type="button"
              size="icon"
              onClick={handleRefresh}
              aria-label={tGlobal('refresh')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleShift(0)}
            >
              {tConfig('timestamp-converter.quickNow')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleShift(-60)}
            >
              {tConfig('timestamp-converter.quickMinusHour')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleShift(60)}
            >
              {tConfig('timestamp-converter.quickPlusHour')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => handleShift(-1440)}
            >
              {tConfig('timestamp-converter.quickMinusDay')}
            </Button>
          </div>

          {date && (
            <div className="mt-6 space-y-3">
              <ResultRow
                label={tConfig('timestamp-converter.formats.unixSeconds')}
                value={String(Math.floor(date.getTime() / 1000))}
              />
              <ResultRow
                label={tConfig('timestamp-converter.formats.unixMs')}
                value={String(date.getTime())}
              />
              <ResultRow
                label={tConfig('timestamp-converter.formats.iso')}
                value={date.toISOString()}
              />
              <ResultRow
                label={tConfig('timestamp-converter.formats.local')}
                value={date.toLocaleString(
                  locale === 'ru' ? 'ru-RU' : 'en-US',
                  {dateStyle: 'full', timeStyle: 'long'},
                )}
              />
              <ResultRow
                label={tConfig('timestamp-converter.formats.relative')}
                value={relativeTime(date)}
              />

              <div className="pt-4">
                <div className="mb-2 text-xs text-muted-foreground">
                  {tConfig('timestamp-converter.inOtherTimezones')}
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  {TIMEZONES.map(tz => (
                    <div
                      key={tz}
                      className="rounded border bg-background p-2 font-mono"
                    >
                      {tz}: {formatInTimezone(date, tz, locale)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border bg-card p-6">
          <textarea
            value={batch}
            onChange={e => setBatch(e.target.value)}
            placeholder={tConfig('timestamp-converter.batchPlaceholder')}
            spellCheck={false}
            className="h-40 w-full resize-none rounded-xl border bg-background p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />

          <div className="mt-3 flex items-center gap-2">
            <Button type="button" disabled={!batch}>
              <List className="mr-1.5 h-4 w-4" />
              {tConfig('timestamp-converter.convertBatch')}
            </Button>
            {batchResults.length > 0 && (
              <CopyButton
                getValue={() =>
                  batchResults
                    .map(r =>
                      r.error
                        ? `${r.input}\t${r.output}`
                        : `${r.input}\t${r.output} (${r.relative})`,
                    )
                    .join('\n')
                }
                labelIdle={tGlobal('copyAll')}
                className="h-9 px-3"
              />
            )}
          </div>

          {batchResults.length > 0 && (
            <div className="mt-4 space-y-2 text-sm">
              {batchResults.map((r, i) => (
                <div
                  key={`${r.input}-${i}`}
                  className="rounded-2xl border bg-background p-3"
                >
                  <div className="font-mono text-muted-foreground">
                    {r.input}
                  </div>
                  <div
                    className={r.error ? 'text-red-600 dark:text-red-400' : ''}
                  >
                    {r.error ? r.output : `${r.output} (${r.relative})`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ResultRowProps {
  label: string
  value: string
}

function ResultRow({label, value}: ResultRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-mono break-all">
        {value}
        <CopyButton
          getValue={() => value}
          className="h-6 w-6 p-0"
          showLabel={false}
          tooltipSide="right"
        />
      </span>
    </div>
  )
}
