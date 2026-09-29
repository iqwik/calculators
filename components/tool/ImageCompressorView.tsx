'use client'

import {Download, ImagePlus, Trash2, Wand2, X} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useRef, useState} from 'react'
import {useEvent} from '@/hooks/use-event'
import {useSmoothProgress} from '@/hooks/use-smooth-progress'
import {Button} from '../ui/button'
import {Slider} from '../ui/slider'

type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png'

type Item = {
  id: string
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  // заполняется после Compress
  compressedUrl?: string
  compressedSize?: number
  outputWidth?: number
  outputHeight?: number
  format?: OutputFormat
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function reduction(original: number, compressed: number): number {
  if (original === 0) return 0
  return Math.max(0, Math.round((1 - compressed / original) * 100))
}

function stripExt(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(0, i) : name
}

function extFromFormat(format: OutputFormat): string {
  if (format === 'image/jpeg') return 'jpg'
  if (format === 'image/webp') return 'webp'
  return 'png'
}

export function ImageCompressorView() {
  const t = useTranslations('config.image-compressor')
  const tGlobal = useTranslations('global')

  const [items, setItems] = useState<Item[]>([])
  const [maxWidth, setMaxWidth] = useState(1920)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<OutputFormat>('image/jpeg')
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const smoothProgress = useSmoothProgress(progress)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressedCount = items.filter(i => i.compressedUrl).length
  const totalOriginal = items.reduce((s, i) => s + i.originalSize, 0)
  const totalCompressed = items.reduce((s, i) => s + (i.compressedSize ?? 0), 0)
  const totalReduction =
    compressedCount > 0 ? reduction(totalOriginal, totalCompressed) : 0

  const qualityActive = format !== 'image/png'
  const activeFormatLabel = useMemo(
    () =>
      format === 'image/jpeg'
        ? 'JPEG'
        : format === 'image/webp'
          ? 'WebP'
          : 'PNG',
    [format],
  )

  const addFiles = useEvent(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    const added: Item[] = []

    for (const file of arr) {
      try {
        const bitmap = await createImageBitmap(file)
        const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`
        added.push({
          id,
          file,
          originalUrl: URL.createObjectURL(file),
          originalSize: file.size,
          originalWidth: bitmap.width,
          originalHeight: bitmap.height,
        })
        bitmap.close()
      } catch {
        // skip broken files
      }
    }

    setItems(prev => [...prev, ...added])
  })

  const onDrop = useEvent((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      void addFiles(e.dataTransfer.files)
    }
  })

  const onDragOver = useEvent((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setDragging(true)
  })

  const onDragLeave = useEvent((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setDragging(false)
  })

  const compressAll = useEvent(async () => {
    setBusy(true)
    setProgress(0)

    const updated: Item[] = []
    const total = items.length

    for (let i = 0; i < total; i++) {
      const item = items[i]
      try {
        const bitmap = await createImageBitmap(item.file)

        let outWidth = bitmap.width
        let outHeight = bitmap.height
        if (outWidth > maxWidth) {
          outHeight = Math.round((bitmap.height * maxWidth) / outWidth)
          outWidth = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = outWidth
        canvas.height = outHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          bitmap.close()
          updated.push(item)
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        // PNG сохраняет прозрачность — фон не заливаем.
        // JPEG не поддерживает альфу — заливаем белым.
        if (format !== 'image/png') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, outWidth, outHeight)
        }
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(bitmap, 0, 0, outWidth, outHeight)
        bitmap.close()

        const blob: Blob | null = await new Promise(resolve =>
          canvas.toBlob(resolve, format, quality / 100),
        )
        if (!blob) {
          updated.push(item)
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)

        updated.push({
          ...item,
          compressedUrl: URL.createObjectURL(blob),
          compressedSize: blob.size,
          outputWidth: outWidth,
          outputHeight: outHeight,
          format,
        })
      } catch {
        updated.push(item)
      }

      setProgress(Math.round(((i + 1) / total) * 100))
    }

    setItems(updated)
    setBusy(false)
    setProgress(0)
  })

  const downloadOne = useEvent((item: Item) => {
    if (!item.compressedUrl || !item.format) return
    const ext = extFromFormat(item.format)
    const a = document.createElement('a')
    a.href = item.compressedUrl
    a.download = `${stripExt(item.file.name)}-compressed.${ext}`
    a.click()
  })

  const downloadAll = useEvent(async () => {
    for (const item of items) {
      if (item.compressedUrl) {
        downloadOne(item)
        await new Promise(r => setTimeout(r, 120))
      }
    }
  })

  const removeItem = useEvent((id: string) => {
    setItems(prev => {
      const target = prev.find(i => i.id === id)
      if (target) {
        URL.revokeObjectURL(target.originalUrl)
        if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl)
      }
      return prev.filter(i => i.id !== id)
    })
  })

  const clearAll = useEvent(() => {
    for (const i of items) {
      URL.revokeObjectURL(i.originalUrl)
      if (i.compressedUrl) URL.revokeObjectURL(i.compressedUrl)
    }
    setItems([])
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Settings */}
      <div className="rounded-xl border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium tracking-wide text-muted-foreground">
                {t('maxWidth')}
              </label>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {maxWidth}px
              </span>
            </div>
            <Slider
              value={[maxWidth]}
              min={320}
              max={4000}
              step={80}
              onValueChange={v =>
                setMaxWidth(Array.isArray(v) ? (v[0] ?? 1920) : v)
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium tracking-wide text-muted-foreground">
                {t('quality')}
              </label>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {quality}%
              </span>
            </div>
            <Slider
              value={[quality]}
              min={10}
              max={100}
              step={5}
              disabled={!qualityActive}
              onValueChange={v =>
                setQuality(Array.isArray(v) ? (v[0] ?? 80) : v)
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-wide text-muted-foreground">
              {t('format')}
            </label>
            <div className="inline-flex flex-wrap items-center gap-0.5 rounded-md bg-muted p-0.5 text-muted-foreground">
              {(
                [
                  {value: 'image/jpeg', label: 'JPEG'},
                  {value: 'image/webp', label: 'WebP'},
                  {value: 'image/png', label: 'PNG'},
                ] as const
              ).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={`rounded-sm px-3 py-1 text-xs font-medium transition ${
                    format === opt.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {t('settingsHint')}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {t('stats.queue', {count: items.length})}
          </p>
          <Button
            type="button"
            onClick={() => void compressAll()}
            disabled={busy || items.length === 0}
            className="gap-1.5"
          >
            <Wand2 className="h-4 w-4" />
            {busy
              ? t('actions.compressingPercent', {percent: smoothProgress})
              : t('actions.compressAll')}
          </Button>
        </div>
      </div>

      {/* Dropzone */}
      <button
        type="button"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/40'
        }`}
      >
        <ImagePlus className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t('dropzone')}</p>
        <p className="text-xs text-muted-foreground">{t('dropzoneHint')}</p>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => {
          if (e.target.files) void addFiles(e.target.files)
          e.target.value = ''
        }}
        className="hidden"
      />

      {/* Results */}
      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              <span>{t('files', {count: items.length})}</span>
              <span>
                {formatBytes(totalOriginal)}
                {compressedCount > 0 && ` → ${formatBytes(totalCompressed)}`}
              </span>
              {compressedCount > 0 && totalReduction > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  −{totalReduction}%
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadAll}
                disabled={compressedCount === 0}
              >
                <Download className="mr-1.5 h-4 w-4" />
                {tGlobal('download')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                {tGlobal('clear')}
              </Button>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {items.map(item => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4"
              >
                <div className="relative flex flex-col h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/40">
                  {/* biome-ignore lint/performance/noImgElement: blob preview */}
                  <img
                    src={item.compressedUrl ?? item.originalUrl}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                  {item.compressedUrl && (
                    <span className="absolute right-2 top-2 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {t('stats.ready')}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.file.name}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
                    {item.outputWidth && item.outputHeight
                      ? `${item.originalWidth}×${item.originalHeight} → ${item.outputWidth}×${item.outputHeight}`
                      : `${item.originalWidth}×${item.originalHeight}`}
                    <span className="mx-1.5">·</span>
                    {formatBytes(item.originalSize)}
                    {item.compressedSize
                      ? ` → ${formatBytes(item.compressedSize)}`
                      : ''}
                    {item.compressedSize && (
                      <>
                        <span className="mx-1.5">·</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          −{reduction(item.originalSize, item.compressedSize)}%
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadOne(item)}
                    disabled={!item.compressedUrl}
                    aria-label={tGlobal('download')}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.id)}
                    aria-label={t('actions.remove')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {t('privacyNote')}
      </p>
    </div>
  )
}
