'use client'

import {Image as ImageIcon, Loader2, Upload, Wand2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useState} from 'react'
import {
  blobToDataUri,
  bytesToBase64,
  parseBase64Image,
} from '@/helpers/utils/base64-image'
import {useEvent} from '@/hooks/use-event'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Label} from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {Slider} from '../ui/slider'

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

type Result = {
  previewUrl: string
  dataUri: string
  cleanBase64: string
  mime: string
  byteSize: number
  width: number
  height: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'img'
}

export function Base64ImageOptimizerView() {
  const t = useTranslations('config.base64-image-optimizer')
  const tGlobal = useTranslations('global')

  const [input, setInput] = useState('')
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1920)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<OutputFormat>('image/webp')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [originalMime, setOriginalMime] = useState<string>('')

  const [result, setResult] = useState<Result | null>(null)

  const resetResult = useEvent(() => {
    if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl)
    setResult(null)
  })

  const clearAll = useEvent(() => {
    if (originalPreview?.startsWith('blob:'))
      URL.revokeObjectURL(originalPreview)
    if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl)
    setInput('')
    setOriginalPreview(null)
    setOriginalSize(0)
    setOriginalMime('')
    setResult(null)
    setError(null)
  })

  const handleFile = useEvent(async (files: FileList | File[]) => {
    const file = Array.from(files).find(f => f.type.startsWith('image/'))
    if (!file) return
    resetResult()
    setError(null)

    const dataUri = await blobToDataUri(file)
    setInput(dataUri)

    if (originalPreview?.startsWith('blob:'))
      URL.revokeObjectURL(originalPreview)
    const url = URL.createObjectURL(file)
    setOriginalPreview(url)
    setOriginalSize(file.size)
    setOriginalMime(file.type)
  })

  const optimize = useEvent(async () => {
    setBusy(true)
    setError(null)
    resetResult()

    const parsed = parseBase64Image(input)
    if (!parsed) {
      setError(t('errors.invalid'))
      setBusy(false)
      return
    }

    if (parsed.mime === 'image/unknown') {
      setError(t('errors.unknownFormat'))
      setBusy(false)
      return
    }

    if (parsed.mime === 'image/svg+xml') {
      setError(t('errors.svgNotSupported'))
      setBusy(false)
      return
    }

    // Обновляем превью исходника, если его нет или источник изменился
    const blob = new Blob([parsed.bytes as unknown as BlobPart], {
      type: parsed.mime,
    })
    if (originalPreview?.startsWith('blob:'))
      URL.revokeObjectURL(originalPreview)
    setOriginalPreview(URL.createObjectURL(blob))
    setOriginalSize(parsed.bytes.length)
    setOriginalMime(parsed.mime)

    try {
      const bitmap = await createImageBitmap(blob)

      let outW = bitmap.width
      let outH = bitmap.height
      const scale = Math.min(
        maxWidth > 0 ? maxWidth / outW : 1,
        maxHeight > 0 ? maxHeight / outH : 1,
        1,
      )
      if (scale < 1) {
        outW = Math.max(1, Math.round(outW * scale))
        outH = Math.max(1, Math.round(outH * scale))
      }

      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        bitmap.close()
        setError(t('errors.canvas'))
        setBusy(false)
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // JPEG не поддерживает альфу — заливаем белым
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, outW, outH)
      }

      ctx.drawImage(bitmap, 0, 0, outW, outH)
      bitmap.close()

      const outBlob: Blob | null = await new Promise(resolve =>
        canvas.toBlob(resolve, format, quality / 100),
      )
      if (!outBlob) {
        setError(t('errors.encode'))
        setBusy(false)
        return
      }

      const outBytes = new Uint8Array(await outBlob.arrayBuffer())
      const cleanBase64 = bytesToBase64(outBytes)
      const dataUri = `data:${format};base64,${cleanBase64}`

      const previewUrl = URL.createObjectURL(outBlob)

      setResult({
        previewUrl,
        dataUri,
        cleanBase64,
        mime: format,
        byteSize: outBytes.length,
        width: outW,
        height: outH,
      })
    } catch {
      setError(t('errors.decode'))
    }

    setBusy(false)
  })

  const downloadResult = useEvent(() => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.previewUrl
    a.download = `optimized.${extFromMime(result.mime)}`
    a.click()
  })

  const savings =
    result && originalSize > 0
      ? Math.round(((originalSize - result.byteSize) / originalSize) * 100)
      : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground">
              {t('inputs.format')}
            </Label>
            <Select
              value={format}
              onValueChange={v => setFormat(v as OutputFormat)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image/webp">WebP</SelectItem>
                <SelectItem value="image/jpeg">JPEG</SelectItem>
                <SelectItem value="image/png">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="b64-max-w"
              className="text-xs font-medium tracking-wide text-muted-foreground"
            >
              {t('inputs.maxWidth')}
            </Label>
            <Input
              id="b64-max-w"
              type="number"
              min={0}
              step={1}
              value={maxWidth || ''}
              onChange={e =>
                setMaxWidth(Math.max(0, Number(e.target.value) || 0))
              }
              className="h-9"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="b64-max-h"
              className="text-xs font-medium tracking-wide text-muted-foreground"
            >
              {t('inputs.maxHeight')}
            </Label>
            <Input
              id="b64-max-h"
              type="number"
              min={0}
              step={1}
              value={maxHeight || ''}
              onChange={e =>
                setMaxHeight(Math.max(0, Number(e.target.value) || 0))
              }
              className="h-9"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                {t('inputs.quality')}
              </Label>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {quality}%
              </span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={v =>
                setQuality(Array.isArray(v) ? (v[0] ?? 80) : v)
              }
              min={10}
              max={100}
              step={1}
              disabled={format === 'image/png'}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{t('hints.privacy')}</p>
          <Button
            type="button"
            onClick={() => void optimize()}
            disabled={busy || !input.trim()}
            className="gap-1.5"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {busy ? t('actions.optimizing') : t('actions.optimize')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <InputPanel
            title={
              <span className="flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5" />
                {t('sections.input')}
              </span>
            }
            value={input}
            onChange={setInput}
            placeholder={t('placeholders.input')}
            heightClass="h-[360px]"
            headerExtra={
              <label
                htmlFor="b64-file"
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-input px-2 py-0.5 text-[11px] hover:bg-muted"
              >
                <Upload className="h-3 w-3" />
                {t('actions.upload')}
                <input
                  id="b64-file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={e => {
                    if (e.target.files) void handleFile(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            }
            actions={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {tGlobal('clear')}
              </Button>
            }
          />

          {originalPreview && (
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-muted/40">
                {/* biome-ignore lint/performance/noImgElement: blob preview */}
                <img
                  src={originalPreview}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{t('sections.original')}</p>
                <p className="font-mono text-xs text-muted-foreground tabular-nums">
                  {originalMime || '—'} · {formatBytes(originalSize)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <OutputPanel
            title={t('sections.output')}
            value={result?.dataUri ?? ''}
            heightClass="h-[360px]"
            onDownload={result ? downloadResult : undefined}
          />

          {result && (
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-muted/40">
                {/* biome-ignore lint/performance/noImgElement: blob preview */}
                <img
                  alt=""
                  src={result.previewUrl}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{t('sections.optimized')}</p>
                <p className="font-mono text-xs text-muted-foreground tabular-nums">
                  {result.width}×{result.height} ·{' '}
                  {formatBytes(result.byteSize)}
                  {savings > 0 && (
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                      −{savings}%
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
