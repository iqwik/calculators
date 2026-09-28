'use client'

import {RefreshCw} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useEffectEvent, useState} from 'react'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {Checkbox} from '../ui/checkbox'
import {Input} from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
]

type Unit = 'paragraphs' | 'sentences' | 'words'

interface Options {
  count: number
  unit: Unit
  startWithLorem: boolean
  htmlTags: boolean
}

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function generateWords(count: number, startWithLorem: boolean): string {
  const words: string[] = []
  if (startWithLorem) {
    words.push('lorem', 'ipsum', 'dolor', 'sit', 'amet')
  }
  while (words.length < count) {
    words.push(randomWord())
  }
  return words.slice(0, count).join(' ')
}

function generateSentence(startWithLorem: boolean): string {
  const length = 8 + Math.floor(Math.random() * 10)
  const words = generateWords(length, startWithLorem).split(' ')
  return `${capitalize(words.join(' '))}.`
}

function generateParagraph(startWithLorem: boolean): string {
  const sentences = 3 + Math.floor(Math.random() * 3)
  const parts: string[] = []
  for (let i = 0; i < sentences; i++) {
    parts.push(generateSentence(i === 0 && startWithLorem))
  }
  return parts.join(' ')
}

function generate(options: Options): string {
  const {count, unit, startWithLorem, htmlTags} = options

  if (count <= 0) return ''

  if (unit === 'words') {
    const text = generateWords(count, startWithLorem)
    return `${capitalize(text)}.`
  }

  if (unit === 'sentences') {
    const parts: string[] = []
    for (let i = 0; i < count; i++) {
      parts.push(generateSentence(i === 0 && startWithLorem))
    }
    return parts.join(' ')
  }

  // paragraphs
  const parts: string[] = []
  for (let i = 0; i < count; i++) {
    const p = generateParagraph(i === 0 && startWithLorem)
    parts.push(htmlTags ? `<p>${p}</p>` : p)
  }
  return parts.join(htmlTags ? '\n\n' : '\n\n')
}

export function LoremIpsumView() {
  const t = useTranslations('config')

  const [count, setCount] = useState(3)
  const [unit, setUnit] = useState<Unit>('paragraphs')
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [htmlTags, setHtmlTags] = useState(false)
  const [output, setOutput] = useState('')

  const regenerate = useEffectEvent((overrides?: Partial<Options>) => {
    const opts: Options = {
      count,
      unit,
      startWithLorem,
      htmlTags,
      ...overrides,
    }
    setOutput(generate(opts))
  })

  useEffect(() => {
    regenerate()
  }, [])

  const maxCount = unit === 'words' ? 1000 : unit === 'sentences' ? 100 : 50

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="lorem-count" className="text-sm font-medium">
            {t('lorem-ipsum-generator.countLabel')}
          </label>
          <Input
            id="lorem-count"
            type="number"
            min={1}
            max={maxCount}
            value={count}
            onChange={e => {
              const v = Math.max(1, Math.min(maxCount, Number(e.target.value)))
              setCount(v)
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lorem-unit" className="text-sm font-medium">
            {t('lorem-ipsum-generator.unitLabel')}
          </label>
          <Select
            items={[
              {
                value: 'paragraphs',
                label: t('lorem-ipsum-generator.units.paragraphs'),
              },
              {
                value: 'sentences',
                label: t('lorem-ipsum-generator.units.sentences'),
              },
              {value: 'words', label: t('lorem-ipsum-generator.units.words')},
            ]}
            value={unit}
            onValueChange={v => {
              const next = (v ?? 'paragraphs') as Unit
              setUnit(next)
            }}
          >
            <SelectTrigger id="lorem-unit" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraphs">
                {t('lorem-ipsum-generator.units.paragraphs')}
              </SelectItem>
              <SelectItem value="sentences">
                {t('lorem-ipsum-generator.units.sentences')}
              </SelectItem>
              <SelectItem value="words">
                {t('lorem-ipsum-generator.units.words')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button type="button" onClick={() => regenerate()} className="w-full">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            {t('lorem-ipsum-generator.generate')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Checkbox
            id="lorem-start"
            checked={startWithLorem}
            onCheckedChange={checked => setStartWithLorem(checked === true)}
          />
          <label
            htmlFor="lorem-start"
            className="cursor-pointer select-none text-sm font-medium"
          >
            {t('lorem-ipsum-generator.startWithLorem')}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="lorem-html"
            checked={htmlTags}
            onCheckedChange={checked => setHtmlTags(checked === true)}
          />
          <label
            htmlFor="lorem-html"
            className="cursor-pointer select-none text-sm font-medium"
          >
            {t('lorem-ipsum-generator.htmlTags')}
          </label>
        </div>
      </div>

      <OutputPanel
        title={t('lorem-ipsum-generator.outputLabel')}
        value={output}
      />
    </div>
  )
}
