'use client'

import {AlertCircle} from 'lucide-react'
import {useLocale, useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {CopyButton} from '../shared/CopyButton'
import {InputPanel} from '../shared/InputPanel'

interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  expired: boolean
  expiresAt: Date | null
  issuedAt: Date | null
  notBefore: Date | null
  algorithm: string
}

type DecodeResult = DecodedJwt | {error: string}

function base64UrlDecode(input: string): string {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4
  if (pad) normalized += '='.repeat(4 - pad)
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function JwtDecoderView() {
  const t = useTranslations('config')
  const locale = useLocale()

  const [token, setToken] = useState('')

  const decoded = useMemo<DecodeResult | null>(() => {
    if (!token.trim()) return null

    const parts = token.trim().split('.')
    if (parts.length !== 3) {
      return {error: t('jwt-decoder.notThreeParts')}
    }

    const [headerB64, payloadB64, signature] = parts

    let header: Record<string, unknown>
    let payload: Record<string, unknown>

    try {
      header = JSON.parse(base64UrlDecode(headerB64))
    } catch {
      return {error: t('jwt-decoder.invalidHeader')}
    }

    try {
      payload = JSON.parse(base64UrlDecode(payloadB64))
    } catch {
      return {error: t('jwt-decoder.invalidPayload')}
    }

    const now = Date.now() / 1000
    const exp = typeof payload.exp === 'number' ? payload.exp : null
    const iat = typeof payload.iat === 'number' ? payload.iat : null
    const nbf = typeof payload.nbf === 'number' ? payload.nbf : null
    const algorithm = typeof header.alg === 'string' ? header.alg : '—'

    return {
      header,
      payload,
      signature,
      algorithm,
      expired: exp !== null && exp < now,
      expiresAt: exp !== null ? new Date(exp * 1000) : null,
      issuedAt: iat !== null ? new Date(iat * 1000) : null,
      notBefore: nbf !== null ? new Date(nbf * 1000) : null,
    }
  }, [token, t])

  const isError = decoded !== null && 'error' in decoded

  function fmtDate(d: Date | null): string {
    if (!d) return '—'
    return d.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="space-y-5">
      <InputPanel
        title={t('jwt-decoder.inputLabel')}
        value={token}
        onChange={setToken}
        placeholder={t('jwt-decoder.placeholder')}
        heightClass="h-[140px]"
        mono
      />

      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{(decoded as {error: string}).error}</span>
        </div>
      )}

      {decoded && !isError && (
        <DecodedResult decoded={decoded as DecodedJwt} fmtDate={fmtDate} />
      )}
    </div>
  )
}

interface ResultProps {
  decoded: DecodedJwt
  fmtDate: (d: Date | null) => string
}

function DecodedResult({decoded, fmtDate}: ResultProps) {
  const t = useTranslations('config')
  const headerJson = JSON.stringify(decoded.header, null, 2)
  const payloadJson = JSON.stringify(decoded.payload, null, 2)

  return (
    <div className="space-y-4">
      {/* Indicator cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label={t('jwt-decoder.algorithmLabel')}
          value={decoded.algorithm}
          tone="violet"
        />
        <StatCard
          label={t('jwt-decoder.statusLabel')}
          value={
            decoded.expired ? t('jwt-decoder.expired') : t('jwt-decoder.valid')
          }
          tone={decoded.expired ? 'red' : 'green'}
        />
        <StatCard
          label={t('jwt-decoder.expiresLabel')}
          value={decoded.expiresAt ? fmtDate(decoded.expiresAt) : 'N/A'}
          tone="neutral"
        />
      </div>

      {/* Header / Payload side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <JsonBlock
          title={t('jwt-decoder.headerLabel')}
          subtitle={t('jwt-decoder.headerHint')}
          json={headerJson}
          tone="rose"
        />
        <JsonBlock
          title={t('jwt-decoder.payloadLabel')}
          subtitle={t('jwt-decoder.payloadHint')}
          json={payloadJson}
          tone="violet"
        />
      </div>

      {/* Signature full-width */}
      <SignatureBlock
        title={t('jwt-decoder.signatureLabel')}
        signature={decoded.signature}
      />
    </div>
  )
}

type Tone = 'red' | 'green' | 'violet' | 'rose' | 'neutral' | 'blue'

const TONE_CLASSES: Record<Tone, {bg: string; label: string; value: string}> = {
  red: {
    bg: 'border-red-500/30 bg-red-500/10',
    label: 'text-red-700 dark:text-red-300',
    value: 'text-red-800 dark:text-red-200',
  },
  green: {
    bg: 'border-green-500/30 bg-green-500/10',
    label: 'text-green-700 dark:text-green-300',
    value: 'text-green-800 dark:text-green-200',
  },
  violet: {
    bg: 'border-violet-500/30 bg-violet-500/10',
    label: 'text-violet-700 dark:text-violet-300',
    value: 'text-violet-800 dark:text-violet-200',
  },
  rose: {
    bg: 'border-rose-500/30 bg-rose-500/10',
    label: 'text-rose-700 dark:text-rose-300',
    value: 'text-rose-800 dark:text-rose-200',
  },
  blue: {
    bg: 'border-blue-500/30 bg-blue-500/10',
    label: 'text-blue-700 dark:text-blue-300',
    value: 'text-blue-800 dark:text-blue-200',
  },
  neutral: {
    bg: 'border-border bg-muted/40',
    label: 'text-muted-foreground',
    value: 'text-foreground',
  },
}

interface StatCardProps {
  label: string
  value: string
  tone: Tone
}

function StatCard({label, value, tone}: StatCardProps) {
  const c = TONE_CLASSES[tone]
  return (
    <div className={`rounded-2xl border p-4 ${c.bg}`}>
      <div
        className={`text-[10px] font-bold tracking-widest uppercase ${c.label}`}
      >
        {label}
      </div>
      <div className={`mt-1 text-lg font-semibold break-all ${c.value}`}>
        {value}
      </div>
    </div>
  )
}

interface JsonBlockProps {
  title: string
  subtitle: string
  json: string
  tone: Tone
}

function JsonBlock({title, subtitle, json, tone}: JsonBlockProps) {
  const c = TONE_CLASSES[tone]
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border ${c.bg}`}>
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-[10px] font-bold tracking-widest uppercase ${c.label}`}
          >
            {title}
          </span>
          <span className={`text-[10px] ${c.label} opacity-60`}>
            {subtitle}
          </span>
        </div>
        <CopyButton
          getValue={() => json}
          showLabel={false}
          className="h-6 w-6 p-0"
        />
      </div>
      <pre className="max-h-[320px] overflow-auto border-t border-current/10 px-4 py-3 font-mono text-xs leading-relaxed text-foreground">
        {json}
      </pre>
    </div>
  )
}

interface SignatureBlockProps {
  title: string
  signature: string
}

function SignatureBlock({title, signature}: SignatureBlockProps) {
  const c = TONE_CLASSES.blue
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border ${c.bg}`}>
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <span
          className={`text-[10px] font-bold tracking-widest uppercase ${c.label}`}
        >
          {title}
        </span>
        <CopyButton
          getValue={() => signature}
          showLabel={false}
          className="h-6 w-6 p-0"
        />
      </div>
      <pre className="max-h-[120px] overflow-auto border-t border-current/10 px-4 py-3 font-mono text-xs leading-relaxed break-all text-foreground">
        {signature}
      </pre>
    </div>
  )
}
