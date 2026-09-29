'use client'

import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {CopyButton} from '../shared/CopyButton'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'
import {Badge} from '../ui/badge'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Label} from '../ui/label'

interface MatchInfo {
  index: number
  length: number
  groups: {name: string | null; value: string}[]
}

interface Segment {
  text: string
  isMatch: boolean
}

interface CollectResult {
  matches: MatchInfo[]
  segments: Segment[]
  truncated: boolean
}

const FLAGS = ['g', 'i', 'm', 's', 'u', 'y'] as const
type Flag = (typeof FLAGS)[number]

const MAX_MATCHES = 10000

function collectMatches(regex: RegExp, text: string): CollectResult {
  const matches: MatchInfo[] = []
  const segments: Segment[] = []
  let lastEnd = 0

  regex.lastIndex = 0

  for (;;) {
    const m = regex.exec(text)
    if (m === null) break

    if (matches.length >= MAX_MATCHES) {
      return {matches, segments, truncated: true}
    }

    if (m.index === regex.lastIndex) regex.lastIndex++

    matches.push({
      index: m.index,
      length: m[0].length,
      groups: m.map(val => ({name: null, value: val ?? ''})),
    })

    if (m.index > lastEnd) {
      segments.push({text: text.slice(lastEnd, m.index), isMatch: false})
    }
    segments.push({text: m[0], isMatch: true})
    lastEnd = m.index + m[0].length

    if (!regex.global) break
  }

  if (lastEnd < text.length) {
    segments.push({text: text.slice(lastEnd), isMatch: false})
  }

  return {matches, segments, truncated: false}
}

export function RegexTesterView() {
  const t = useTranslations('config.regex-tester')
  const tGlobal = useTranslations('global')

  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b')
  const [flags, setFlags] = useState<Flag[]>(['g'])
  const [testText, setTestText] = useState(
    'Contact us at hello@example.com or support@mycompany.org.\nInvalid: not-an-email',
  )

  const toggleFlag = (flag: Flag) => {
    setFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag],
    )
  }

  const result = useMemo(() => {
    if (!pattern) {
      return {
        error: null as string | null,
        matches: [] as MatchInfo[],
        segments: [] as Segment[],
        truncated: false,
      }
    }

    let regex: RegExp
    try {
      regex = new RegExp(pattern, flags.join(''))
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : t('invalidRegex'),
        matches: [] as MatchInfo[],
        segments: [] as Segment[],
        truncated: false,
      }
    }

    try {
      const {matches, segments, truncated} = collectMatches(regex, testText)
      return {error: null, matches, segments, truncated}
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : t('invalidRegex'),
        matches: [] as MatchInfo[],
        segments: [] as Segment[],
        truncated: false,
      }
    }
  }, [pattern, flags, testText, t])

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Label className="text-xs font-medium tracking-wide text-muted-foreground">
            {t('patternLabel')}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPattern('')
              setFlags(['g'])
              setTestText('')
            }}
          >
            {tGlobal('reset')}
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 font-mono text-sm dark:bg-input/30">
          <span className="shrink-0 select-none text-muted-foreground">/</span>
          <Input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder={t('patternPlaceholder')}
            className="min-w-0 flex-1 bg-transparent py-1 outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          <span className="shrink-0 select-none text-muted-foreground">
            /{flags.join('')}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {FLAGS.map(flag => {
            const active = flags.includes(flag)
            return (
              <Button
                key={flag}
                type="button"
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFlag(flag)}
                title={t(`flags.${flag}`)}
                aria-pressed={active}
                className="h-7 w-7 p-0 font-mono text-xs"
              >
                {flag}
              </Button>
            )
          })}
          <Badge variant="outline" className="ml-auto text-xs">
            {result.matches.length}{' '}
            {result.matches.length === 1 ? t('match') : t('matches')}
          </Badge>
        </div>

        {result.error && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400">
            {t('invalidRegex')}: {result.error}
          </p>
        )}

        {result.truncated && (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            {t('truncated')}
          </p>
        )}
      </div>

      <InputPanel
        title={t('testTextLabel')}
        value={testText}
        onChange={setTestText}
        placeholder={t('testTextPlaceholder')}
        heightClass="h-[200px]"
        actions={<CopyButton getValue={() => testText} disabled={!testText} />}
      />

      <OutputPanel
        title={t('highlightedLabel')}
        value={testText}
        heightClass="h-[280px]"
        rawContent
      >
        {result.error ? (
          <span className="text-muted-foreground">—</span>
        ) : result.segments.length === 0 ? (
          <span className="text-muted-foreground">{t('noMatches')}</span>
        ) : (
          <pre className="font-mono text-sm whitespace-pre-wrap">
            {result.segments.map((seg, i) =>
              seg.isMatch ? (
                <mark
                  key={i}
                  className="rounded bg-yellow-200 px-0.5 text-foreground dark:bg-yellow-800/60"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </pre>
        )}
      </OutputPanel>

      {result.matches.length > 0 && (
        <OutputPanel
          title={t('matchesLabel')}
          value={result.matches
            .map(
              (m, i) =>
                `#${i + 1}  index=${m.index}\n` +
                m.groups
                  .map(
                    (g, gi) =>
                      `  ${gi === 0 ? '$&' : `$${gi}`}: ${g.value || '—'}`,
                  )
                  .join('\n'),
            )
            .join('\n\n')}
          heightClass="h-auto max-h-[420px]"
          rawContent
        >
          <div className="flex flex-col gap-3">
            {result.matches.map((m, i) => (
              <div
                key={i}
                className="rounded-lg border bg-background p-3 font-mono text-xs"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    #{i + 1}
                  </Badge>
                  <span className="text-muted-foreground">
                    {t('indexLabel')}: {m.index}
                  </span>
                </div>
                {m.groups.map((g, gi) => (
                  <div key={gi} className="flex gap-2 py-0.5">
                    <span className="shrink-0 text-muted-foreground">
                      {gi === 0 ? t('fullMatch') : `$${gi}`}:
                    </span>
                    <span className="break-all text-foreground">
                      {g.value || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </OutputPanel>
      )}
    </div>
  )
}
