'use client'

import {AlertCircle, KeyRound} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {CopyButton} from '../shared/CopyButton'
import {InputPanel} from '../shared/InputPanel'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

type Algorithm = 'HS256' | 'HS384' | 'HS512'

const ALGORITHMS: Algorithm[] = ['HS256', 'HS384', 'HS512']

function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function signHmac(
  algorithm: Algorithm,
  secret: string,
  data: string,
): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    {name: 'HMAC', hash: algorithm.replace('HS', 'SHA-')},
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  const bytes = new Uint8Array(sig)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function tryParseJson(input: string):
  | {
      ok: true
      value: Record<string, unknown>
    }
  | {ok: false; error: string} {
  if (!input.trim()) return {ok: true, value: {}}
  try {
    const parsed = JSON.parse(input)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {ok: false, error: 'Must be a JSON object'}
    }
    return {ok: true, value: parsed as Record<string, unknown>}
  } catch (e) {
    return {ok: false, error: e instanceof Error ? e.message : String(e)}
  }
}

export function JwtEncoderView() {
  const tConfig = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [algorithm, setAlgorithm] = useState<Algorithm>('HS256')
  const [secret, setSecret] = useState('')
  const [headerJson, setHeaderJson] = useState(
    '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
  )
  const [payloadJson, setPayloadJson] = useState(
    '{\n  "sub": "1234567890",\n  "name": "John Doe"\n}',
  )

  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const headerParsed = useMemo(() => tryParseJson(headerJson), [headerJson])
  const payloadParsed = useMemo(() => tryParseJson(payloadJson), [payloadJson])

  async function handleGenerate() {
    setError(null)

    if (!headerParsed.ok) {
      setError(`${tConfig('jwt-encoder.headerLabel')}: ${headerParsed.error}`)
      return
    }
    if (!payloadParsed.ok) {
      setError(`${tConfig('jwt-encoder.payloadLabel')}: ${payloadParsed.error}`)
      return
    }
    if (!secret) {
      setError(tConfig('jwt-encoder.secretRequired'))
      return
    }

    setGenerating(true)
    try {
      const header = {...headerParsed.value, alg: algorithm, typ: 'JWT'}
      const payload = {...payloadParsed.value}

      const encodedHeader = base64UrlEncode(JSON.stringify(header))
      const encodedPayload = base64UrlEncode(JSON.stringify(payload))
      const signingInput = `${encodedHeader}.${encodedPayload}`
      const signature = await signHmac(algorithm, secret, signingInput)

      setToken(`${signingInput}.${signature}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setGenerating(false)
    }
  }

  function handleClear() {
    setHeaderJson('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
    setPayloadJson('{\n  "sub": "1234567890",\n  "name": "John Doe"\n}')
    setSecret('')
    setToken('')
    setError(null)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputPanel
          title={tConfig('jwt-encoder.headerLabel')}
          value={headerJson}
          onChange={setHeaderJson}
          placeholder='{"alg": "HS256", "typ": "JWT"}'
          heightClass="h-[180px]"
          mono
        />
        <InputPanel
          title={tConfig('jwt-encoder.payloadLabel')}
          value={payloadJson}
          onChange={setPayloadJson}
          placeholder='{"sub": "1234567890"}'
          heightClass="h-[180px]"
          mono
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {tConfig('jwt-encoder.algorithmLabel')}
          </label>
          <Select
            items={ALGORITHMS.map(a => ({value: a, label: a}))}
            value={algorithm}
            onValueChange={v => setAlgorithm(v as Algorithm)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map(a => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="jwt-secret"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {tConfig('jwt-encoder.secretLabel')}
          </label>
          <Input
            id="jwt-secret"
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder={tConfig('jwt-encoder.secretPlaceholder')}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={handleGenerate} disabled={generating}>
          {generating
            ? tConfig('jwt-encoder.generating')
            : tConfig('jwt-encoder.generate')}
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          {tGlobal('clear')}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {token && (
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {tConfig('jwt-encoder.outputLabel')}
            </span>
            <CopyButton
              getValue={() => token}
              showLabel={false}
              className="h-6 w-6 p-0"
            />
          </div>
          <pre className="max-h-60 overflow-auto p-4 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
            {token}
          </pre>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {tConfig('jwt-encoder.securityNote')}
      </p>
    </div>
  )
}
