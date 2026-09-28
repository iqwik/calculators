'use client'

import {ArrowRightLeft, Lock, LockOpen, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useState} from 'react'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {SegmentedControl} from '../ui/segmented-control'

type Mode = 'encode' | 'decode'
type Kind = 'component' | 'full'

function encode(text: string, kind: Kind): string {
  return kind === 'full' ? encodeURI(text) : encodeURIComponent(text)
}

function decode(text: string, kind: Kind): string {
  return kind === 'full' ? decodeURI(text) : decodeURIComponent(text)
}

export function UrlEncoderView() {
  const tConfig = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [mode, setMode] = useState<Mode>('encode')
  const [kind, setKind] = useState<Kind>('component')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function run(nextMode: Mode, nextKind: Kind, value: string) {
    setError(null)

    if (!value) {
      setOutput('')
      return
    }

    try {
      const result =
        nextMode === 'encode'
          ? encode(value, nextKind)
          : decode(value, nextKind)
      setOutput(result)
    } catch {
      setError(tConfig('url-encoder-decoder.errorInvalid'))
      setOutput('')
    }
  }

  function handleMode(next: Mode) {
    setMode(next)
    run(next, kind, input)
  }

  function handleKind(next: Kind) {
    setKind(next)
    run(mode, next, input)
  }

  function handleInput(value: string) {
    setInput(value)
    run(mode, kind, value)
  }

  function handleSwap() {
    const nextMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(nextMode)
    setInput(output)
    setOutput(input)
    setError(null)
  }

  function handleClear() {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          name="url-mode"
          value={mode}
          onChange={handleMode}
          options={[
            {
              value: 'encode',
              label: tConfig('url-encoder-decoder.encode'),
              icon: Lock,
            },
            {
              value: 'decode',
              label: tConfig('url-encoder-decoder.decode'),
              icon: LockOpen,
            },
          ]}
        />

        <SegmentedControl
          name="url-kind"
          value={kind}
          onChange={handleKind}
          options={[
            {
              value: 'component',
              label: tConfig('url-encoder-decoder.kindComponent'),
            },
            {value: 'full', label: tConfig('url-encoder-decoder.kindFull')},
          ]}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!input && !output}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {tGlobal('clear')}
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          <InputPanel
            title={
              mode === 'encode'
                ? tConfig('url-encoder-decoder.plainInput')
                : tConfig('url-encoder-decoder.encodedInput')
            }
            value={input}
            onChange={handleInput}
            placeholder={
              mode === 'encode'
                ? tConfig('url-encoder-decoder.plainPlaceholder')
                : tConfig('url-encoder-decoder.encodedPlaceholder')
            }
            heightClass="h-[280px]"
            mono
          />
          <p className="text-xs text-muted-foreground">
            {input.length} {tConfig('url-encoder-decoder.characters')}
          </p>
        </div>

        <div className="flex items-center justify-center py-4 md:py-0 md:self-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            aria-label={tConfig('url-encoder-decoder.swap')}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        <OutputPanel
          title={
            mode === 'encode'
              ? tConfig('url-encoder-decoder.encodedOutput')
              : tConfig('url-encoder-decoder.plainOutput')
          }
          value={output}
          heightClass="h-[280px]"
          contentClassName="font-mono whitespace-pre-wrap break-words"
        >
          {output || (
            <span className="text-muted-foreground">
              {tConfig('url-encoder-decoder.outputPlaceholder')}
            </span>
          )}
        </OutputPanel>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}
