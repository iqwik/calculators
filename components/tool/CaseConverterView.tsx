'use client'

import {Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {Button} from '@/components/ui/button'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'

type CaseType =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'

const CASES: CaseType[] = [
  'upper',
  'lower',
  'title',
  'sentence',
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
]

function toTitleCase(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function toSentenceCase(text: string): string {
  const lower = text.toLowerCase()
  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase())
}

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

function toCamelCase(text: string): string {
  const words = splitWords(text).map(w => w.toLowerCase())
  if (words.length === 0) return ''
  return (
    words[0] +
    words
      .slice(1)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
  )
}

function toPascalCase(text: string): string {
  const words = splitWords(text).map(w => w.toLowerCase())
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

function toSnakeCase(text: string): string {
  return splitWords(text)
    .map(w => w.toLowerCase())
    .join('_')
}

function toKebabCase(text: string): string {
  return splitWords(text)
    .map(w => w.toLowerCase())
    .join('-')
}

function toConstantCase(text: string): string {
  return splitWords(text)
    .map(w => w.toUpperCase())
    .join('_')
}

function convert(text: string, type: CaseType): string {
  if (!text) return ''
  switch (type) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'title':
      return toTitleCase(text)
    case 'sentence':
      return toSentenceCase(text)
    case 'camel':
      return toCamelCase(text)
    case 'pascal':
      return toPascalCase(text)
    case 'snake':
      return toSnakeCase(text)
    case 'kebab':
      return toKebabCase(text)
    case 'constant':
      return toConstantCase(text)
  }
}

export function CaseConverterView() {
  const t = useTranslations('config')

  const [text, setText] = useState('')
  const [activeCase, setActiveCase] = useState<CaseType>('upper')

  const converted = useMemo(() => convert(text, activeCase), [text, activeCase])

  return (
    <div className="space-y-5">
      <InputPanel
        title={t('case-converter.inputLabel')}
        value={text}
        onChange={setText}
        placeholder={t('case-converter.placeholder')}
        heightClass="h-[260px]"
        mono={false}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setText('')}
            disabled={!text}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('case-converter.clear')}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {CASES.map(c => (
          <Button
            key={c}
            size="sm"
            type="button"
            variant={activeCase === c ? 'default' : 'outline'}
            onClick={() => setActiveCase(c)}
          >
            {t(`case-converter.cases.${c}`)}
          </Button>
        ))}
      </div>

      <OutputPanel
        title={t('case-converter.outputLabel')}
        value={converted}
        heightClass="min-h-[140px]"
      >
        {converted || (
          <span className="text-muted-foreground">
            {t('case-converter.outputPlaceholder')}
          </span>
        )}
      </OutputPanel>
    </div>
  )
}
