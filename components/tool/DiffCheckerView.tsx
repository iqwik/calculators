'use client'

import {type Change, diffLines} from 'diff'
import {ArrowRightLeft, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {Button} from '@/components/ui/button'
import {InputPanel} from '../shared/InputPanel'
import {SegmentedControl} from '../ui/segmented-control'

export function DiffCheckerView() {
  const t = useTranslations('config')

  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [mode, setMode] = useState<'split' | 'unified'>('split')

  const changes = useMemo<Change[]>(() => {
    if (!left && !right) return []
    return diffLines(left, right)
  }, [left, right])

  const stats = useMemo(() => {
    let added = 0
    let removed = 0
    for (const part of changes) {
      const lines = part.value.split('\n').length
      if (part.added) added += lines
      else if (part.removed) removed += lines
    }
    return {added, removed}
  }, [changes])

  function handleClear() {
    setLeft('')
    setRight('')
  }

  function handleSwap() {
    const tmp = left
    setLeft(right)
    setRight(tmp)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          name="diff-mode"
          value={mode}
          onChange={setMode}
          options={[
            {value: 'split', label: t('diff-checker.split')},
            {value: 'unified', label: t('diff-checker.unified')},
          ]}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSwap}
          data-testid="arrot-right-left-button"
        >
          <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
          {t('diff-checker.swap')}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!left && !right}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {t('diff-checker.clear')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputPanel
          title={t('diff-checker.leftLabel')}
          value={left}
          onChange={setLeft}
          placeholder={t('diff-checker.leftPlaceholder')}
          heightClass="h-[360px]"
          mono
        />
        <InputPanel
          title={t('diff-checker.rightLabel')}
          value={right}
          onChange={setRight}
          placeholder={t('diff-checker.rightPlaceholder')}
          heightClass="h-[360px]"
          mono
        />
      </div>

      {(left || right) && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 font-medium text-green-700 dark:text-green-300">
              +{stats.added} {t('diff-checker.added')}
            </span>
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-medium text-red-700 dark:text-red-300">
              −{stats.removed} {t('diff-checker.removed')}
            </span>
          </div>

          {mode === 'split' ? (
            <SplitView changes={changes} />
          ) : (
            <UnifiedView changes={changes} />
          )}
        </>
      )}
    </div>
  )
}

interface ViewProps {
  changes: Change[]
}

function SplitView({changes}: ViewProps) {
  const leftLines: {text: string; type: 'same' | 'removed'}[] = []
  const rightLines: {text: string; type: 'same' | 'added'}[] = []

  for (const part of changes) {
    const lines = part.value.replace(/\n$/, '').split('\n')
    for (const line of lines) {
      if (part.added) {
        rightLines.push({text: line, type: 'added'})
      } else if (part.removed) {
        leftLines.push({text: line, type: 'removed'})
      } else {
        leftLines.push({text: line, type: 'same'})
        rightLines.push({text: line, type: 'same'})
      }
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DiffColumn lines={leftLines} />
      <DiffColumn lines={rightLines} />
    </div>
  )
}

interface DiffLine {
  text: string
  type: 'same' | 'added' | 'removed'
}

interface ColumnProps {
  lines: DiffLine[]
}

function DiffColumn({lines}: ColumnProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="max-h-[400px] overflow-auto p-2 font-mono text-xs leading-relaxed">
        {lines.length === 0 ? (
          <div className="p-3 text-muted-foreground">—</div>
        ) : (
          lines.map((line, i) => (
            <div
              key={i}
              className={`flex gap-2 rounded px-2 py-0.5 ${
                line.type === 'added'
                  ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                  : line.type === 'removed'
                    ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                    : ''
              }`}
            >
              <span className="w-8 shrink-0 select-none text-right text-muted-foreground">
                {i + 1}
              </span>
              <span className="whitespace-pre-wrap break-words">
                {line.text || ' '}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function UnifiedView({changes}: ViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="max-h-[500px] overflow-auto p-2 font-mono text-xs leading-relaxed">
        {changes.map((part, partIdx) => {
          const lines = part.value.replace(/\n$/, '').split('\n')
          return lines.map((line, i) => (
            <div
              key={`${partIdx}-${i}`}
              className={`flex gap-2 rounded px-2 py-0.5 ${
                part.added
                  ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                  : part.removed
                    ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                    : ''
              }`}
            >
              <span className="w-4 shrink-0 select-none">
                {part.added ? '+' : part.removed ? '−' : ' '}
              </span>
              <span className="whitespace-pre-wrap break-words">
                {line || ' '}
              </span>
            </div>
          ))
        })}
      </div>
    </div>
  )
}
