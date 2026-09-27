'use client'

import {CheckCircle2, Copy, Minimize2, Play, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'

type Mode = 'beautify-2' | 'beautify-4' | 'minify'

function formatJson(
  input: string,
  mode: Mode,
): {output: string; error: string | null} {
  if (!input.trim()) return {output: '', error: null}

  try {
    const parsed = JSON.parse(input)
    const indent = mode === 'beautify-2' ? 2 : mode === 'beautify-4' ? 4 : 0
    return {output: JSON.stringify(parsed, null, indent), error: null}
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {output: '', error: msg}
  }
}

export function JsonFormatterView() {
  const t = useTranslations('config')

  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('beautify-2')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const {output: next, error: nextError} = formatJson(input, mode)
    setOutput(next)
    setError(nextError)
    setCopied(false)
  }, [input, mode])

  function handleClear() {
    setInput('')
    setOutput('')
    setError(null)
    setCopied(false)
  }

  async function handleCopy() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard может быть недоступен на http
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-2">
        <Button
          type="button"
          variant={mode === 'beautify-2' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('beautify-2')}
        >
          {t('json-formatter.beautify2')}
        </Button>
        <Button
          type="button"
          variant={mode === 'beautify-4' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('beautify-4')}
        >
          {t('json-formatter.beautify4')}
        </Button>
        <Button
          type="button"
          variant={mode === 'minify' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('minify')}
        >
          <Minimize2 className="mr-1.5 h-3.5 w-3.5" />
          {t('json-formatter.minify')}
        </Button>
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
        <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
            <Play className="h-3.5 w-3.5 text-amber-500" />
            <h3 className="text-sm font-semibold">
              {t('json-formatter.inputLabel')}
            </h3>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            placeholder={t('json-formatter.inputPlaceholder')}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
        </div>

        <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <h3 className="text-sm font-semibold">
                {t('json-formatter.outputLabel')}
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
              className="h-7 px-2 text-xs"
            >
              {copied ? (
                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <Copy className="mr-1 h-3 w-3" />
              )}
              {copied ? t('json-formatter.copied') : t('json-formatter.copy')}
            </Button>
          </div>
          <textarea
            readOnly
            value={output}
            spellCheck={false}
            placeholder={t('json-formatter.outputPlaceholder')}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
        </div>
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
