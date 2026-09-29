'use client'

import {toCardinal as toCardinalEn} from 'n2words/en'
import {toCardinal as toCardinalRu} from 'n2words/ru'
import {useLocale, useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {OutputPanel} from '../shared/OutputPanel'
import {Input} from '../ui/input'
import {Label} from '../ui/label'

const MAX = 1e15

type Converter = (n: number) => string

const CONVERTERS: Record<string, Converter> = {
  en: n => toCardinalEn(n),
  ru: n => toCardinalRu(n),
}

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  uk: 'Українська',
  tr: 'Türkçe',
  cs: 'Čeština',
  sv: 'Svenska',
  da: 'Dansk',
  no: 'Norsk',
  fi: 'Suomi',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  he: 'עברית',
  fa: 'فارسی',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  ro: 'Română',
  hu: 'Magyar',
  el: 'Ελληνικά',
}

function toWordsSafe(n: number, locale: string): string {
  const converter = CONVERTERS[locale]
  if (!converter) return '—'
  try {
    return converter(n)
  } catch {
    return '—'
  }
}

function formatNumberLocal(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString()
}

export function NumberToWordsView() {
  const t = useTranslations('config.number-to-words-converter')
  const locale = useLocale()
  const [raw, setRaw] = useState('1234567')

  const n = useMemo(() => Math.round(Number(raw)), [raw])
  const valid = Number.isFinite(n) && Math.abs(n) <= MAX

  const shownLocales = useMemo(() => {
    const list = ['en']
    if (locale !== 'en') list.push(locale)
    return list
  }, [locale])

  const results = useMemo(
    () =>
      shownLocales.map(loc => ({
        locale: loc,
        label: LOCALE_LABELS[loc] ?? loc.toUpperCase(),
        words: valid ? toWordsSafe(n, loc) : '—',
      })),
    [shownLocales, n, valid],
  )

  const formatted = useMemo(
    () => (valid ? formatNumberLocal(n) : '—'),
    [n, valid],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Input + formatted */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Label className="text-xs font-medium tracking-wide text-muted-foreground">
            {t('inputs.number')}
          </Label>
          <span className="text-xs text-muted-foreground">
            {t('hints.number')}
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="number"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder="1234567"
            className="h-9 font-mono sm:max-w-xs"
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('resultLabel')}:</span>
            <span className="font-mono font-semibold tabular-nums">
              {formatted}
            </span>
          </div>
        </div>
      </div>

      {/* Words in each shown locale */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {results.map(r => (
          <div key={r.locale} className="min-w-0 flex-1">
            <OutputPanel
              title={r.label}
              value={r.words}
              heightClass="min-h-[140px]"
              rawContent
            >
              <p className="font-mono text-base leading-relaxed wrap-break-word">
                {r.words}
              </p>
            </OutputPanel>
          </div>
        ))}
      </div>

      {!valid && raw.trim() !== '' && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {t('errors.outOfRange')}
        </p>
      )}
    </div>
  )
}
