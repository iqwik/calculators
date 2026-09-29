'use client'

import {Check, X} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'
import {Badge} from '../ui/badge'
import {Label} from '../ui/label'

type CharCategory = 'digit' | 'lower' | 'upper' | 'space' | 'literal'

interface Token {
  category: CharCategory
  length: number
  samples: string[]
}

interface ExplanationPart {
  regex: string
  descKey: string
}

interface GenerateResult {
  pattern: string
  explanation: ExplanationPart[]
  error: 'noExamples' | 'structureMismatch' | 'invalidRegex' | null
}

const MAX_LINES = 100
const MAX_LINE_LENGTH = 500

function classify(char: string): CharCategory {
  if (/\d/.test(char)) return 'digit'
  if (/[a-z]/.test(char)) return 'lower'
  if (/[A-Z]/.test(char)) return 'upper'
  if (/\s/.test(char)) return 'space'
  return 'literal'
}

function escapeRegex(char: string): string {
  return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  for (const char of text) {
    const category = classify(char)
    const last = tokens[tokens.length - 1]
    if (last && last.category === category) {
      last.length++
      last.samples.push(char)
    } else {
      tokens.push({category, length: 1, samples: [char]})
    }
  }
  return tokens
}

function categoryToClass(category: CharCategory): string | null {
  switch (category) {
    case 'digit':
      return '\\d'
    case 'lower':
      return '[a-z]'
    case 'upper':
      return '[A-Z]'
    case 'space':
      return '\\s'
    case 'literal':
      return null
  }
}

function generateRegex(positives: string[]): GenerateResult {
  if (positives.length === 0) {
    return {pattern: '', explanation: [], error: 'noExamples'}
  }

  const tokenized = positives.map(tokenize)
  const len = tokenized[0].length
  const sameLen = tokenized.every(t => t.length === len)

  if (!sameLen) {
    return {pattern: '', explanation: [], error: 'structureMismatch'}
  }

  const parts: string[] = []
  const explanation: ExplanationPart[] = []

  for (let i = 0; i < len; i++) {
    const cats = tokenized.map(t => t[i].category)
    const allSame = cats.every(c => c === cats[0])

    if (!allSame) {
      parts.push('.')
      explanation.push({regex: '.', descKey: 'any'})
      continue
    }

    const category = cats[0]
    const lengths = tokenized.map(t => t[i].length)
    const allSameLength = lengths.every(l => l === lengths[0])
    const length = lengths[0]

    if (category === 'literal') {
      const samples = tokenized.map(t => t[i].samples[0])
      const allSameChar = samples.every(s => s === samples[0])

      if (allSameChar) {
        const escaped = escapeRegex(samples[0])
        parts.push(escaped)
        explanation.push({regex: escaped, descKey: 'literal'})
      } else {
        parts.push('.')
        explanation.push({regex: '.', descKey: 'any'})
      }
      continue
    }

    const cls = categoryToClass(category)
    if (!cls) {
      parts.push('.')
      explanation.push({regex: '.', descKey: 'any'})
      continue
    }

    const quantifier = allSameLength && length > 1 ? `{${length}}` : '+'
    const full = `${cls}${quantifier}`
    parts.push(full)
    explanation.push({regex: full, descKey: category})
  }

  return {pattern: parts.join(''), explanation, error: null}
}

function findNegativeViolations(
  pattern: string,
  negatives: string[],
): string[] {
  if (!pattern || negatives.length === 0) return []
  try {
    const regex = new RegExp(`^(?:${pattern})$`)
    return negatives.filter(n => regex.test(n))
  } catch {
    return []
  }
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .slice(0, MAX_LINES)
    .map(l => l.slice(0, MAX_LINE_LENGTH))
}

export function RegexGeneratorView() {
  const t = useTranslations('config.regex-generator')

  const [positivesText, setPositivesText] = useState(
    'hello@example.com\ntest@mycompany.org\nadmin@test.io',
  )
  const [negativesText, setNegativesText] = useState(
    'not-an-email\nhello@\n@example.com',
  )

  const positives = useMemo(() => splitLines(positivesText), [positivesText])
  const negatives = useMemo(() => splitLines(negativesText), [negativesText])

  const result = useMemo(() => generateRegex(positives), [positives])
  const violations = useMemo(
    () => findNegativeViolations(result.pattern, negatives),
    [result.pattern, negatives],
  )

  const fullRegex = result.pattern ? `/${result.pattern}/g` : ''

  return (
    <div className="flex flex-col gap-4">
      <InputPanel
        title={t('positivesLabel')}
        value={positivesText}
        onChange={setPositivesText}
        placeholder={t('positivesPlaceholder')}
        heightClass="h-[180px]"
      />

      <InputPanel
        title={t('negativesLabel')}
        value={negativesText}
        onChange={setNegativesText}
        placeholder={t('negativesPlaceholder')}
        heightClass="h-[140px]"
      />

      <OutputPanel
        title={t('resultLabel')}
        value={fullRegex}
        heightClass="h-auto"
        rawContent
        disableCopy={!fullRegex}
      >
        {result.error === 'noExamples' ? (
          <p className="text-sm text-muted-foreground">
            {t('errors.noExamples')}
          </p>
        ) : result.error === 'structureMismatch' ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t('errors.structureMismatch')}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm break-all text-foreground">
                /{result.pattern}/g
              </code>
            </div>

            {result.explanation.length > 0 && (
              <div>
                <Label className="mb-2 block text-xs font-medium tracking-wide text-muted-foreground">
                  {t('explanationLabel')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {result.explanation.map((part, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 rounded-md border bg-background px-2 py-1"
                    >
                      <code className="font-mono text-xs text-foreground">
                        {part.regex}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {t(`explanation.${part.descKey}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {negatives.length > 0 && (
              <div>
                <Label className="mb-2 block text-xs font-medium tracking-wide text-muted-foreground">
                  {t('negativeCheckLabel')}
                </Label>
                {violations.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <span>{t('negativeCheck.pass')}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <X className="h-4 w-4" />
                      <span>{t('negativeCheck.fail')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {violations.map((v, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {positives.length}{' '}
                {positives.length === 1 ? t('example') : t('examples')}
              </Badge>
              {negatives.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {negatives.length}{' '}
                  {negatives.length === 1 ? t('negative') : t('negatives')}
                </Badge>
              )}
            </div>
          </div>
        )}
      </OutputPanel>
    </div>
  )
}
