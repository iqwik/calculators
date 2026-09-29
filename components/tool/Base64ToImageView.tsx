'use client'

import Image from 'next/image'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {Button} from '../ui/button'
import {Textarea} from '../ui/textarea'

interface ParsedImage {
  dataUri: string
  mime: string
  extension: string
  sizeBytes: number
}

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
  'image/avif': 'avif',
}

function guessMimeFromBase64(b64: string): string | null {
  // Magic bytes detection
  if (b64.startsWith('iVBORw0KGgo')) return 'image/png'
  if (b64.startsWith('/9j/')) return 'image/jpeg'
  if (b64.startsWith('R0lGOD')) return 'image/gif'
  if (b64.startsWith('UklGR')) return 'image/webp'
  if (b64.startsWith('Qk')) return 'image/bmp'
  if (b64.startsWith('PHN2Zy') || b64.startsWith('PD94bWw')) {
    return 'image/svg+xml'
  }
  if (b64.startsWith('AAAAIGZ0eXBhdmlm')) return 'image/avif'
  return null
}

function parseInput(raw: string): ParsedImage | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Case 1: data URI with prefix
  const dataUriMatch = trimmed.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s,
  )
  if (dataUriMatch) {
    const mime = dataUriMatch[1].toLowerCase()
    const b64 = dataUriMatch[2].replace(/\s+/g, '')
    const extension = MIME_TO_EXT[mime] ?? 'png'
    // Estimate size from base64 length
    const sizeBytes = Math.floor((b64.length * 3) / 4)
    return {
      dataUri: `data:${mime};base64,${b64}`,
      mime,
      extension,
      sizeBytes,
    }
  }

  // Case 2: bare base64
  const b64 = trimmed.replace(/\s+/g, '')
  if (!/^[A-Za-z0-9+/]+=*$/.test(b64)) return null

  const mime = guessMimeFromBase64(b64)
  if (!mime) return null

  const extension = MIME_TO_EXT[mime] ?? 'png'
  const sizeBytes = Math.floor((b64.length * 3) / 4)

  return {
    dataUri: `data:${mime};base64,${b64}`,
    mime,
    extension,
    sizeBytes,
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function Base64ToImageView() {
  const t = useTranslations('config.base64-to-image')
  const tGlobal = useTranslations('global')
  const [input, setInput] = useState('')

  const parsed = useMemo(() => parseInput(input), [input])
  const hasInput = input.trim().length > 0

  const handleDownload = () => {
    if (!parsed) return
    // Convert data URI to blob for reliable download
    const [header, b64] = parsed.dataUri.split(',')
    const mimeMatch = header.match(/data:([^;]+)/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([bytes], {type: mime})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `image.${parsed.extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left column — input */}
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
              onClick={() => setInput('')}
              disabled={!hasInput}
            >
              {tGlobal('clear')}
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="h-64 resize-none font-mono text-xs break-all"
          />
          {hasInput && !parsed && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
              {t('invalidHint')}
            </p>
          )}
          {parsed && (
            <p className="mt-3 text-xs text-muted-foreground">
              {t('detected')}: <span className="font-mono">{parsed.mime}</span>
              {' · '}
              {formatBytes(parsed.sizeBytes)}
            </p>
          )}
        </div>
      </div>

      {/* Right column — preview + download */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div
          className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05)), linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05))',
            backgroundSize: '20px 20px',
            backgroundPosition: '0px 0px, 10px 10px',
          }}
        >
          {parsed ? (
            <Image
              src={parsed.dataUri}
              alt={t('previewAlt')}
              width={400}
              height={400}
              unoptimized
              className="max-h-72 w-auto drop-shadow-md"
              style={{objectFit: 'contain'}}
            />
          ) : (
            <span className="text-center text-sm text-muted-foreground">
              {t('previewEmpty')}
            </span>
          )}
        </div>

        <Button
          type="button"
          onClick={handleDownload}
          disabled={!parsed}
          className="w-full"
        >
          {tGlobal('download')}
        </Button>
      </div>
    </div>
  )
}
