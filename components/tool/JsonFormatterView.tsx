'use client'

import {Minimize2, Play, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useEffectEvent, useState} from 'react'
import {Button} from '@/components/ui/button'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'
import {SegmentedControl} from '../ui/segmented-control'

type Mode = 'beautify-2' | 'beautify-4' | 'minify'

export function JsonFormatterView() {
  const t = useTranslations('config')

  const formatJson = useEffectEvent(
    (input: string, mode: Mode): {output: string; error: string | null} => {
      if (!input.trim()) return {output: '', error: null}

      try {
        const parsed = JSON.parse(input)
        const indent = mode === 'beautify-2' ? 2 : mode === 'beautify-4' ? 4 : 0
        return {output: JSON.stringify(parsed, null, indent), error: null}
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return {output: '', error: msg}
      }
    },
  )

  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('beautify-2')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const {output: next, error: nextError} = formatJson(input, mode)
    setOutput(next)
    setError(nextError)
  }, [input, mode])

  function handleClear() {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-2">
        <SegmentedControl
          name="json-mode"
          value={mode}
          onChange={setMode}
          options={[
            {value: 'beautify-2', label: t('json-formatter.beautify2')},
            {value: 'beautify-4', label: t('json-formatter.beautify4')},
            {
              value: 'minify',
              label: t('json-formatter.minify'),
              icon: Minimize2,
            },
          ]}
        />
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {t('json-formatter.clear')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputPanel
          title={t('json-formatter.inputLabel')}
          value={input}
          onChange={setInput}
          placeholder={t('json-formatter.inputPlaceholder')}
          icon={Play}
          iconClassName="text-amber-500"
        />

        <OutputPanel
          title={t('json-formatter.outputLabel')}
          value={output}
          heightClass="h-[420px]"
          contentClassName="font-mono overflow-auto"
        >
          {output || (
            <span className="text-muted-foreground">
              {t('json-formatter.outputPlaceholder')}
            </span>
          )}
        </OutputPanel>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <span className="font-semibold">
            {t('json-formatter.errorLabel')}:{' '}
          </span>
          {error}
        </div>
      )}
    </div>
  )
}
