'use client'

import Image from 'next/image'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {CopyButton} from '../shared/CopyButton'
import {Button} from '../ui/button'
import {Textarea} from '../ui/textarea'

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#4f46e5" />
  <path d="M35 50l10 10 20-20" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function toUrlEncoded(str: string): string {
  return encodeURIComponent(str)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
    .replace(/%20/g, ' ')
}

export function SvgToBase64View() {
  const t = useTranslations('config.svg-to-base64')
  const tGlobal = useTranslations('global')
  const [svg, setSvg] = useState(DEFAULT_SVG)

  const trimmed = svg.trim()
  const hasSvg = trimmed.length > 0

  const base64 = useMemo(
    () => (hasSvg ? toBase64(trimmed) : ''),
    [trimmed, hasSvg],
  )
  const urlEncoded = useMemo(
    () => (hasSvg ? toUrlEncoded(trimmed) : ''),
    [trimmed, hasSvg],
  )

  const dataUriBase64 = base64 ? `data:image/svg+xml;base64,${base64}` : ''
  const dataUriEncoded = urlEncoded ? `data:image/svg+xml,${urlEncoded}` : ''

  const cssBase64 = dataUriBase64
    ? `background-image: url("${dataUriBase64}");`
    : ''
  const cssEncoded = dataUriEncoded
    ? `background-image: url("${dataUriEncoded}");`
    : ''
  const imgTag = dataUriBase64
    ? `<img src="${dataUriBase64}" alt="SVG Image" />`
    : ''

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              {t('inputLabel')}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSvg(DEFAULT_SVG)}
            >
              {tGlobal('reset')}
            </Button>
          </div>
          <Textarea
            value={svg}
            onChange={e => setSvg(e.target.value)}
            placeholder="<svg>...</svg>"
            className="h-48 resize-none font-mono text-sm"
          />
        </div>

        <div
          className="relative flex min-h-50 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05)), linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05))',
            backgroundSize: '20px 20px',
            backgroundPosition: '0px 0px, 10px 10px',
          }}
        >
          {hasSvg ? (
            <Image
              src={dataUriBase64}
              alt={t('previewAlt')}
              width={200}
              height={200}
              unoptimized
              className="max-h-48 w-auto drop-shadow-md"
              style={{objectFit: 'contain'}}
            />
          ) : (
            <span className="text-sm text-muted-foreground">
              {t('previewEmpty')}
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="border-b border-border pb-2 text-lg font-bold">
            {t('snippetsTitle')}
          </h3>

          <Snippet
            label={t('cssUrlEncoded')}
            badge={t('optimalBadge')}
            value={cssEncoded}
            copyTitle={tGlobal('copy')}
            copiedTitle={tGlobal('copied')}
          />

          <Snippet
            label={t('cssBase64')}
            value={cssBase64}
            copyTitle={tGlobal('copy')}
            copiedTitle={tGlobal('copied')}
          />

          <Snippet
            label={t('htmlImg')}
            value={imgTag}
            copyTitle={tGlobal('copy')}
            copiedTitle={tGlobal('copied')}
          />

          <Snippet
            label={t('rawDataUri')}
            value={dataUriBase64}
            copyTitle={tGlobal('copy')}
            copiedTitle={tGlobal('copied')}
            multiline
          />
        </div>
      </div>
    </div>
  )
}

interface SnippetProps {
  label: string
  value: string
  badge?: string
  copyTitle: string
  copiedTitle: string
  multiline?: boolean
}

function Snippet({label, value, badge, multiline}: SnippetProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          {label}
          {badge && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
              {badge}
            </span>
          )}
        </span>
        <CopyButton
          getValue={() => value}
          disabled={!value}
          showLabel={false}
          className="shrink-0"
        />
      </div>
      {multiline ? (
        <Textarea
          readOnly
          value={value}
          className="h-20 resize-none font-mono text-xs break-all"
        />
      ) : (
        <Textarea
          readOnly
          value={value}
          className="h-10 resize-none font-mono text-xs"
        />
      )}
    </div>
  )
}
