'use client'

import {Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {InputPanel} from '../shared/InputPanel'
import {Button} from '..//ui/button'

interface Stats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readingTime: number
  speakingTime: number
  avgWordLength: number
}

function computeStats(text: string): Stats {
  const trimmed = text.trim()

  if (!trimmed) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: 0,
      speakingTime: 0,
      avgWordLength: 0,
    }
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0)
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const sentences = trimmed
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0).length
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0).length

  const totalWordLength = words.reduce((sum, w) => sum + w.length, 0)
  const avgWordLength = words.length > 0 ? totalWordLength / words.length : 0

  return {
    words: words.length,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime: Math.ceil(words.length / 200),
    speakingTime: Math.ceil(words.length / 130),
    avgWordLength: Math.round(avgWordLength * 10) / 10,
  }
}

function formatTime(minutes: number): string {
  if (minutes < 1) return '< 1'
  return String(minutes)
}

export function WordCounterView() {
  const t = useTranslations('config')
  const [text, setText] = useState('')

  const stats = useMemo(() => computeStats(text), [text])

  return (
    <div className="space-y-5">
      <InputPanel
        title={t('word-counter.inputLabel')}
        value={text}
        onChange={setText}
        placeholder={t('word-counter.placeholder')}
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
            {t('word-counter.clear')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label={t('word-counter.stats.words')}
          value={stats.words.toLocaleString('en-US')}
          accent
        />
        <StatCard
          label={t('word-counter.stats.characters')}
          value={stats.characters.toLocaleString('en-US')}
        />
        <StatCard
          label={t('word-counter.stats.charactersNoSpaces')}
          value={stats.charactersNoSpaces.toLocaleString('en-US')}
        />
        <StatCard
          label={t('word-counter.stats.sentences')}
          value={stats.sentences.toLocaleString('en-US')}
        />
        <StatCard
          label={t('word-counter.stats.paragraphs')}
          value={stats.paragraphs.toLocaleString('en-US')}
        />
        <StatCard
          label={t('word-counter.stats.readingTime')}
          value={`${formatTime(stats.readingTime)} ${t('word-counter.units.min')}`}
        />
        <StatCard
          label={t('word-counter.stats.speakingTime')}
          value={`${formatTime(stats.speakingTime)} ${t('word-counter.units.min')}`}
        />
        <StatCard
          label={t('word-counter.stats.avgWordLength')}
          value={stats.avgWordLength.toLocaleString('en-US')}
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  accent?: boolean
}

function StatCard({label, value, accent}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold tabular-nums ${accent ? 'text-primary' : ''}`}
      >
        {value}
      </div>
    </div>
  )
}
