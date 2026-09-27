'use client'

import {
  ArrowRightLeft,
  CheckCircle2,
  Copy,
  Lock,
  LockOpen,
  Trash2,
} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useState} from 'react'
import {Button} from '../ui/button'

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
  const [copied, setCopied] = useState(false)

  function run(nextDirection: Direction, nextAlphabet: Alphabet) {
    setError(null)
    setCopied(false)

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
    setCopied(false)

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
    setCopied(false)
  }

  function handleClear() {
    setInput('')
    setOutput('')
    setError(null)
    setCopied(false)
  }

  async function handleCopy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-xl border bg-card">
          <button
            type="button"
            onClick={() => handleDirection('encode')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition ${
              direction === 'encode'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            {t('base64-encoder-decoder.encode')}
          </button>
          <button
            type="button"
            onClick={() => handleDirection('decode')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition ${
              direction === 'decode'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <LockOpen className="h-3.5 w-3.5" />
            {t('base64-encoder-decoder.decode')}
          </button>
        </div>

        <div className="flex overflow-hidden rounded-xl border bg-card">
          <button
            type="button"
            onClick={() => handleAlphabet('standard')}
            className={`px-4 py-2 text-sm font-semibold transition ${
              alphabet === 'standard'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t('base64-encoder-decoder.standard')}
          </button>
          <button
            type="button"
            onClick={() => handleAlphabet('urlSafe')}
            className={`px-4 py-2 text-sm font-semibold transition ${
              alphabet === 'urlSafe'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t('base64-encoder-decoder.urlSafe')}
          </button>
        </div>

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
          <label
            htmlFor="base64-input"
            className="text-xs font-bold tracking-widest text-muted-foreground uppercase"
          >
            {direction === 'encode'
              ? t('base64-encoder-decoder.plainInput')
              : t('base64-encoder-decoder.base64Input')}
          </label>
          <textarea
            id="base64-input"
            value={input}
            onChange={e => handleInput(e.target.value)}
            spellCheck={false}
            rows={10}
            placeholder={
              direction === 'encode'
                ? t('base64-encoder-decoder.plainPlaceholder')
                : t('base64-encoder-decoder.base64Placeholder')
            }
            className="w-full resize-none rounded-xl border bg-card p-4 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground">
            {input.length} {t('base64-encoder-decoder.characters')}
          </p>
        </div>

        <div className="flex items-center justify-center py-4 md:py-0">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="base64-output"
              className="text-xs font-bold tracking-widest text-muted-foreground uppercase"
            >
              {direction === 'encode'
                ? t('base64-encoder-decoder.base64Output')
                : t('base64-encoder-decoder.plainOutput')}
            </label>
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
              {copied
                ? t('base64-encoder-decoder.copied')
                : t('base64-encoder-decoder.copy')}
            </Button>
          </div>
          <textarea
            id="base64-output"
            readOnly
            value={output}
            spellCheck={false}
            rows={10}
            placeholder={t('base64-encoder-decoder.outputPlaceholder')}
            className="w-full resize-none rounded-xl border bg-muted/40 p-4 font-mono text-sm leading-relaxed outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}
