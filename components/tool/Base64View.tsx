'use client'

import {ArrowRightLeft, Lock, LockOpen, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useState} from 'react'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {SegmentedControl} from '../ui/segmented-control'

type Direction = 'encode' | 'decode'
type Alphabet = 'standard' | 'urlSafe'

function encodeBase64(text: string, alphabet: Alphabet): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  const encoded = btoa(binary)
  if (alphabet === 'urlSafe') {
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return encoded
}

function decodeBase64(text: string, alphabet: Alphabet): string {
  let normalized = text.trim()
  if (alphabet === 'urlSafe') {
    normalized = normalized.replace(/-/g, '+').replace(/_/g, '/')
  }
  const pad = normalized.length % 4
  if (pad) normalized += '='.repeat(4 - pad)

  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function Base64View() {
  const t = useTranslations('config')

  const [direction, setDirection] = useState<Direction>('encode')
  const [alphabet, setAlphabet] = useState<Alphabet>('standard')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function run(nextDirection: Direction, nextAlphabet: Alphabet) {
    setError(null)

    if (!input) {
      setOutput('')
      return
    }

    try {
      const result =
        nextDirection === 'encode'
          ? encodeBase64(input, nextAlphabet)
          : decodeBase64(input, nextAlphabet)
      setOutput(result)
    } catch {
      setError(t('base64-encoder-decoder.errorInvalid'))
      setOutput('')
    }
  }

  function handleDirection(next: Direction) {
    setDirection(next)
    run(next, alphabet)
  }

  function handleAlphabet(next: Alphabet) {
    setAlphabet(next)
    run(direction, next)
  }

  function handleInput(value: string) {
    setInput(value)
    setError(null)

    if (!value) {
      setOutput('')
      return
    }

    try {
      const result =
        direction === 'encode'
          ? encodeBase64(value, alphabet)
          : decodeBase64(value, alphabet)
      setOutput(result)
    } catch {
      setError(t('base64-encoder-decoder.errorInvalid'))
      setOutput('')
    }
  }

  function handleSwap() {
    const nextDirection = direction === 'encode' ? 'decode' : 'encode'
    setDirection(nextDirection)
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
          name="base64-direction"
          value={direction}
          onChange={handleDirection}
          options={[
            {
              value: 'encode',
              label: t('base64-encoder-decoder.encode'),
              icon: Lock,
            },
            {
              value: 'decode',
              label: t('base64-encoder-decoder.decode'),
              icon: LockOpen,
            },
          ]}
        />

        <SegmentedControl
          name="base64-alphabet"
          value={alphabet}
          onChange={handleAlphabet}
          options={[
            {value: 'standard', label: t('base64-encoder-decoder.standard')},
            {value: 'urlSafe', label: t('base64-encoder-decoder.urlSafe')},
          ]}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {t('base64-encoder-decoder.clear')}
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          <InputPanel
            title={
              direction === 'encode'
                ? t('base64-encoder-decoder.plainInput')
                : t('base64-encoder-decoder.base64Input')
            }
            value={input}
            onChange={handleInput}
            placeholder={
              direction === 'encode'
                ? t('base64-encoder-decoder.plainPlaceholder')
                : t('base64-encoder-decoder.base64Placeholder')
            }
            heightClass="h-[280px]"
            mono
          />
          <p className="text-xs text-muted-foreground">
            {input.length} {t('base64-encoder-decoder.characters')}
          </p>
        </div>

        <div className="flex items-center justify-center py-4 md:py-0 md:self-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            aria-label={t('base64-encoder-decoder.swap')}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        <OutputPanel
          title={
            direction === 'encode'
              ? t('base64-encoder-decoder.base64Output')
              : t('base64-encoder-decoder.plainOutput')
          }
          value={output}
          heightClass="h-[280px]"
          contentClassName="font-mono whitespace-pre-wrap break-words"
          rawContent
        >
          {output || (
            <span className="text-muted-foreground">
              {t('base64-encoder-decoder.outputPlaceholder')}
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
