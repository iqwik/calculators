'use client'

import {Download, Image as ImageIcon, Trash2, Wand2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useRef, useState} from 'react'
import {useEvent} from '@/hooks/use-event'
import {useSmoothProgress} from '@/hooks/use-smooth-progress'
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

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp'
type ResizeMode = 'contain' | 'cover' | 'stretch'

type Item = {
  id: string
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  convertedUrl?: string
  convertedBlob?: Blob
  convertedSize?: number
  convertedWidth?: number
  convertedHeight?: number
}

const FORMAT_OPTIONS: {value: OutputFormat; label: string; ext: string}[] = [
  {value: 'image/webp', label: 'WebP', ext: 'webp'},
  {value: 'image/jpeg', label: 'JPEG', ext: 'jpg'},
  {value: 'image/png', label: 'PNG', ext: 'png'},
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function stripExt(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(0, i) : name
}

function computeTargetSize(
  w: number,
  h: number,
  maxW: number,
  maxH: number,
  mode: ResizeMode,
): {width: number; height: number} {
  if (maxW <= 0 && maxH <= 0) return {width: w, height: h}

  const limitW = maxW > 0 ? maxW : Number.POSITIVE_INFINITY
  const limitH = maxH > 0 ? maxH : Number.POSITIVE_INFINITY

  if (mode === 'stretch') {
    return {
      width: Math.max(1, Math.round(Math.min(w, limitW))),
      height: Math.max(1, Math.round(Math.min(h, limitH))),
    }
  }

  const scaleW = Number.isFinite(limitW) ? limitW / w : Number.POSITIVE_INFINITY
  const scaleH = Number.isFinite(limitH) ? limitH / h : Number.POSITIVE_INFINITY
  const scale =
    mode === 'cover' ? Math.max(scaleW, scaleH) : Math.min(scaleW, scaleH)

  if (mode === 'contain' && scale > 1) return {width: w, height: h}

  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  }
}

export function ImageConverterView() {
  const t = useTranslations('config.image-converter')
  const tGlobal = useTranslations('global')

  const [items, setItems] = useState<Item[]>([])
  const [format, setFormat] = useState<OutputFormat>('image/webp')
  const [quality, setQuality] = useState(80)
  const [maxW, setMaxW] = useState<number>(0)
  const [maxH, setMaxH] = useState<number>(0)
  const [mode, setMode] = useState<ResizeMode>('contain')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const smoothProgress = useSmoothProgress(progress)
  const inputRef = useRef<HTMLInputElement>(null)

  const ext = useMemo(
    () => FORMAT_OPTIONS.find(f => f.value === format)?.ext ?? 'img',
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

  const onDrop = useEvent((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      void addFiles(e.dataTransfer.files)
    }
  })

  const convertAll = useEvent(async () => {
    setBusy(true)
    setProgress(0)

    const updated: Item[] = []
    const total = items.length

    for (let i = 0; i < total; i++) {
      const item = items[i]
      try {
        const bitmap = await createImageBitmap(item.file)
        const {width, height} = computeTargetSize(
          bitmap.width,
          bitmap.height,
          maxW,
          maxH,
          mode,
        )

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          bitmap.close()
          updated.push(item)
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        if (mode === 'cover') {
          const srcAspect = bitmap.width / bitmap.height
          const dstAspect = width / height
          let sx = 0
          let sy = 0
          let sw = bitmap.width
          let sh = bitmap.height
          if (srcAspect > dstAspect) {
            sw = bitmap.height * dstAspect
            sx = (bitmap.width - sw) / 2
          } else {
            sh = bitmap.width / dstAspect
            sy = (bitmap.height - sh) / 2
          }
          ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height)
        } else {
          ctx.drawImage(bitmap, 0, 0, width, height)
        }
        bitmap.close()

        const blob: Blob | null = await new Promise(resolve =>
          canvas.toBlob(resolve, format, quality / 100),
        )
        if (!blob) {
          updated.push(item)
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl)

        updated.push({
          ...item,
          convertedUrl: URL.createObjectURL(blob),
          convertedBlob: blob,
          convertedSize: blob.size,
          convertedWidth: width,
          convertedHeight: height,
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
    if (!item.convertedUrl) return
    const a = document.createElement('a')
    a.href = item.convertedUrl
    a.download = `${stripExt(item.file.name)}.${ext}`
    a.click()
  })

  const downloadAll = useEvent(async () => {
    for (const item of items) {
      if (item.convertedUrl) {
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
        if (target.convertedUrl) URL.revokeObjectURL(target.convertedUrl)
      }
      return prev.filter(i => i.id !== id)
    })
  })

  const clearAll = useEvent(() => {
    for (const i of items) {
      URL.revokeObjectURL(i.originalUrl)
      if (i.convertedUrl) URL.revokeObjectURL(i.convertedUrl)
    }
    setItems([])
  })

  const convertedCount = items.filter(i => i.convertedUrl).length
  const totalOriginal = items.reduce((s, i) => s + i.originalSize, 0)
  const totalConverted = items.reduce((s, i) => s + (i.convertedSize ?? 0), 0)
  const savings =
    convertedCount > 0 && totalOriginal > 0
      ? Math.round(((totalOriginal - totalConverted) / totalOriginal) * 100)
      : 0

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="image-converter-input"
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card p-8 text-center transition hover:border-primary/40"
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t('hints.drop')}</p>
        <p className="text-xs text-muted-foreground">{t('hints.dropSub')}</p>
        <input
          id="image-converter-input"
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={e => {
            if (e.target.files) void addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </label>

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
                {FORMAT_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="img-max-w"
              className="text-xs font-medium tracking-wide text-muted-foreground"
            >
              {t('inputs.maxWidth')}
            </Label>
            <Input
              id="img-max-w"
              type="number"
              min={0}
              step={1}
              value={maxW || ''}
              placeholder="1920"
              onChange={e => setMaxW(Math.max(0, Number(e.target.value) || 0))}
              className="h-9"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="img-max-h"
              className="text-xs font-medium tracking-wide text-muted-foreground"
            >
              {t('inputs.maxHeight')}
            </Label>
            <Input
              id="img-max-h"
              type="number"
              min={0}
              step={1}
              value={maxH || ''}
              placeholder="1920"
              onChange={e => setMaxH(Math.max(0, Number(e.target.value) || 0))}
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
            {format === 'image/png' && (
              <p className="text-xs text-muted-foreground">
                {t('hints.pngLossless')}
              </p>
            )}
          </div>
        </div>

        {(maxW > 0 || maxH > 0) && (
          <div className="mt-4 flex flex-col gap-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground">
              {t('inputs.mode')}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {(['contain', 'cover', 'stretch'] as const).map(m => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={mode === m ? 'default' : 'outline'}
                  onClick={() => setMode(m)}
                >
                  {t(`modes.${m}`)}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t(`modeHints.${mode}`)}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {t('stats.queue', {count: items.length})}
          </p>
          <Button
            type="button"
            onClick={() => void convertAll()}
            disabled={busy || items.length === 0}
            className="gap-1.5"
          >
            <Wand2 className="h-4 w-4" />
            {busy
              ? t('actions.convertingPercent', {percent: smoothProgress})
              : t('actions.convertAll')}
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              <span>
                {t('stats.files')}:{' '}
                <span className="font-mono text-foreground tabular-nums">
                  {items.length}
                </span>
              </span>
              <span>
                {t('stats.original')}:{' '}
                <span className="font-mono text-foreground tabular-nums">
                  {formatBytes(totalOriginal)}
                </span>
              </span>
              {convertedCount > 0 && (
                <>
                  <span>
                    {t('stats.converted')}:{' '}
                    <span className="font-mono text-foreground tabular-nums">
                      {formatBytes(totalConverted)}
                    </span>
                  </span>
                  {savings > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {t('stats.savings')}:{' '}
                      <span className="font-mono tabular-nums">
                        −{savings}%
                      </span>
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadAll}
                disabled={convertedCount === 0}
              >
                <Download className="mr-1.5 h-4 w-4" />
                {t('actions.downloadAll')}
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-xl border bg-card"
              >
                <div className="relative flex aspect-video items-center justify-center bg-muted/40 p-2">
                  {/* biome-ignore lint/performance/noImgElement: blob preview, optimization not applicable */}
                  <img
                    src={item.convertedUrl ?? item.originalUrl}
                    alt={item.file.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {item.convertedUrl && (
                    <span className="absolute right-2 top-2 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {t('stats.ready')}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p
                    className="truncate text-sm font-medium"
                    title={item.file.name}
                  >
                    {item.file.name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {item.convertedWidth && item.convertedHeight
                      ? `${item.originalWidth}×${item.originalHeight} → ${item.convertedWidth}×${item.convertedHeight}`
                      : `${item.originalWidth}×${item.originalHeight}`}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {formatBytes(item.originalSize)}
                    {item.convertedSize
                      ? ` → ${formatBytes(item.convertedSize)}`
                      : ''}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadOne(item)}
                      disabled={!item.convertedUrl}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      {tGlobal('download')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.id)}
                      aria-label={t('actions.remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
