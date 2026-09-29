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

type FitMode = 'contain' | 'cover' | 'stretch'
type SizeMode = 'max' | 'exact' | 'percent'
type OutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp'

type Item = {
  id: string
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  originalType: string
  resizedUrl?: string
  resizedSize?: number
  resizedWidth?: number
  resizedHeight?: number
}

const FORMAT_OPTIONS: {value: OutputFormat; label: string}[] = [
  {value: 'original', label: 'Keep original'},
  {value: 'image/webp', label: 'WebP'},
  {value: 'image/jpeg', label: 'JPEG'},
  {value: 'image/png', label: 'PNG'},
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

function extFromType(type: string): string {
  if (type === 'image/jpeg') return 'jpg'
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'img'
}

function resolveFormat(
  output: OutputFormat,
  originalType: string,
): {mime: string; ext: string} {
  if (output === 'original') {
    return {
      mime: originalType || 'image/png',
      ext: extFromType(originalType),
    }
  }
  return {mime: output, ext: extFromType(output)}
}

function computeTargetSize(
  w: number,
  h: number,
  params: {
    sizeMode: SizeMode
    maxW: number
    maxH: number
    exactW: number
    exactH: number
    percent: number
    fitMode: FitMode
  },
): {width: number; height: number} {
  const {sizeMode, maxW, maxH, exactW, exactH, percent, fitMode} = params

  if (sizeMode === 'percent') {
    const scale = Math.max(1, percent) / 100
    return {
      width: Math.max(1, Math.round(w * scale)),
      height: Math.max(1, Math.round(h * scale)),
    }
  }

  if (sizeMode === 'exact') {
    return {
      width: Math.max(1, Math.round(exactW || w)),
      height: Math.max(1, Math.round(exactH || h)),
    }
  }

  // max mode
  if (maxW <= 0 && maxH <= 0) return {width: w, height: h}

  const limitW = maxW > 0 ? maxW : Number.POSITIVE_INFINITY
  const limitH = maxH > 0 ? maxH : Number.POSITIVE_INFINITY

  if (fitMode === 'stretch') {
    return {
      width: Math.max(1, Math.round(Math.min(w, limitW))),
      height: Math.max(1, Math.round(Math.min(h, limitH))),
    }
  }

  const scaleW = Number.isFinite(limitW) ? limitW / w : Number.POSITIVE_INFINITY
  const scaleH = Number.isFinite(limitH) ? limitH / h : Number.POSITIVE_INFINITY
  const scale =
    fitMode === 'cover' ? Math.max(scaleW, scaleH) : Math.min(scaleW, scaleH)

  if (fitMode === 'contain' && scale > 1) return {width: w, height: h}

  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  }
}

export function BulkImageResizerView() {
  const t = useTranslations('config.bulk-image-resizer')
  const tGlobal = useTranslations('global')

  const [items, setItems] = useState<Item[]>([])
  const [sizeMode, setSizeMode] = useState<SizeMode>('max')
  const [maxW, setMaxW] = useState<number>(1920)
  const [maxH, setMaxH] = useState<number>(1920)
  const [exactW, setExactW] = useState<number>(800)
  const [exactH, setExactH] = useState<number>(600)
  const [percent, setPercent] = useState<number>(50)
  const [fitMode, setFitMode] = useState<FitMode>('contain')
  const [format, setFormat] = useState<OutputFormat>('original')
  const [quality, setQuality] = useState(85)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const smoothProgress = useSmoothProgress(progress)
  const inputRef = useRef<HTMLInputElement>(null)

  const qualityActive = useMemo(() => {
    if (format === 'image/jpeg' || format === 'image/webp') return true
    if (format === 'original') {
      // Качество применяется только если оригинал JPEG или WebP
      return items.some(
        i => i.originalType === 'image/jpeg' || i.originalType === 'image/webp',
      )
    }
    return false
  }, [format, items])

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
          originalType: file.type || 'image/png',
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

  const resizeAll = useEvent(async () => {
    setBusy(true)
    setProgress(0)

    const updated: Item[] = []
    const total = items.length

    for (let i = 0; i < total; i++) {
      const item = items[i]
      try {
        const bitmap = await createImageBitmap(item.file)
        const {width, height} = computeTargetSize(bitmap.width, bitmap.height, {
          sizeMode,
          maxW,
          maxH,
          exactW,
          exactH,
          percent,
          fitMode,
        })

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

        const {mime} = resolveFormat(format, item.originalType)
        if (mime === 'image/jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)
        }

        const useCover =
          (sizeMode === 'max' && fitMode === 'cover') ||
          (sizeMode === 'exact' && fitMode === 'cover')

        if (useCover) {
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
          canvas.toBlob(resolve, mime, quality / 100),
        )
        if (!blob) {
          updated.push(item)
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        if (item.resizedUrl) URL.revokeObjectURL(item.resizedUrl)

        updated.push({
          ...item,
          resizedUrl: URL.createObjectURL(blob),
          resizedSize: blob.size,
          resizedWidth: width,
          resizedHeight: height,
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
    if (!item.resizedUrl) return
    const {ext} = resolveFormat(format, item.originalType)
    const a = document.createElement('a')
    a.href = item.resizedUrl
    a.download = `${stripExt(item.file.name)}.${ext}`
    a.click()
  })

  const downloadAll = useEvent(async () => {
    for (const item of items) {
      if (item.resizedUrl) {
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
        if (target.resizedUrl) URL.revokeObjectURL(target.resizedUrl)
      }
      return prev.filter(i => i.id !== id)
    })
  })

  const clearAll = useEvent(() => {
    for (const i of items) {
      URL.revokeObjectURL(i.originalUrl)
      if (i.resizedUrl) URL.revokeObjectURL(i.resizedUrl)
    }
    setItems([])
  })

  const resizedCount = items.filter(i => i.resizedUrl).length
  const totalOriginal = items.reduce((s, i) => s + i.originalSize, 0)
  const totalResized = items.reduce((s, i) => s + (i.resizedSize ?? 0), 0)
  const savings =
    resizedCount > 0 && totalOriginal > 0
      ? Math.round(((totalOriginal - totalResized) / totalOriginal) * 100)
      : 0

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="bulk-resizer-input"
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card p-8 text-center transition hover:border-primary/40"
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t('hints.drop')}</p>
        <p className="text-xs text-muted-foreground">{t('hints.dropSub')}</p>
        <input
          id="bulk-resizer-input"
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
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium tracking-wide text-muted-foreground">
            {t('inputs.sizeMode')}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {(['max', 'exact', 'percent'] as const).map(m => (
              <Button
                key={m}
                type="button"
                size="sm"
                variant={sizeMode === m ? 'default' : 'outline'}
                onClick={() => setSizeMode(m)}
              >
                {t(`sizeModes.${m}`)}
              </Button>
            ))}
          </div>
        </div>

        {sizeMode === 'max' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="resizer-max-w"
                className="text-xs font-medium tracking-wide text-muted-foreground"
              >
                {t('inputs.maxWidth')}
              </Label>
              <Input
                id="resizer-max-w"
                type="number"
                min={0}
                step={1}
                value={maxW || ''}
                placeholder="1920"
                onChange={e =>
                  setMaxW(Math.max(0, Number(e.target.value) || 0))
                }
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="resizer-max-h"
                className="text-xs font-medium tracking-wide text-muted-foreground"
              >
                {t('inputs.maxHeight')}
              </Label>
              <Input
                id="resizer-max-h"
                type="number"
                min={0}
                step={1}
                value={maxH || ''}
                placeholder="1920"
                onChange={e =>
                  setMaxH(Math.max(0, Number(e.target.value) || 0))
                }
                className="h-9"
              />
            </div>
          </div>
        )}

        {sizeMode === 'exact' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="resizer-exact-w"
                className="text-xs font-medium tracking-wide text-muted-foreground"
              >
                {t('inputs.exactWidth')}
              </Label>
              <Input
                id="resizer-exact-w"
                type="number"
                min={1}
                step={1}
                value={exactW || ''}
                placeholder="800"
                onChange={e =>
                  setExactW(Math.max(1, Number(e.target.value) || 1))
                }
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="resizer-exact-h"
                className="text-xs font-medium tracking-wide text-muted-foreground"
              >
                {t('inputs.exactHeight')}
              </Label>
              <Input
                id="resizer-exact-h"
                type="number"
                min={1}
                step={1}
                value={exactH || ''}
                placeholder="600"
                onChange={e =>
                  setExactH(Math.max(1, Number(e.target.value) || 1))
                }
                className="h-9"
              />
            </div>
          </div>
        )}

        {sizeMode === 'percent' && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                {t('inputs.percent')}
              </Label>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {percent}%
              </span>
            </div>
            <Slider
              value={[percent]}
              onValueChange={v =>
                setPercent(Array.isArray(v) ? (v[0] ?? 50) : v)
              }
              min={5}
              max={200}
              step={5}
            />
          </div>
        )}

        {(sizeMode === 'max' || sizeMode === 'exact') && (
          <div className="mt-4 flex flex-col gap-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground">
              {t('inputs.fitMode')}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {(['contain', 'cover', 'stretch'] as const).map(m => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={fitMode === m ? 'default' : 'outline'}
                  onClick={() => setFitMode(m)}
                >
                  {t(`fitModes.${m}`)}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t(`fitHints.${fitMode}`)}
            </p>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                    {t(`formats.${o.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                setQuality(Array.isArray(v) ? (v[0] ?? 85) : v)
              }
              min={10}
              max={100}
              step={1}
              disabled={!qualityActive}
            />
            {!qualityActive && (
              <p className="text-xs text-muted-foreground">
                {t('hints.qualityInactive')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {t('stats.queue', {count: items.length})}
          </p>
          <Button
            type="button"
            onClick={() => void resizeAll()}
            disabled={busy || items.length === 0}
            className="gap-1.5"
          >
            <Wand2 className="h-4 w-4" />
            {busy
              ? t('actions.resizingPercent', {percent: smoothProgress})
              : t('actions.resizeAll')}
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
              {resizedCount > 0 && (
                <>
                  <span>
                    {t('stats.resized')}:{' '}
                    <span className="font-mono text-foreground tabular-nums">
                      {formatBytes(totalResized)}
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
                disabled={resizedCount === 0}
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
                    src={item.resizedUrl ?? item.originalUrl}
                    alt={item.file.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {item.resizedUrl && (
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
                    {item.resizedWidth && item.resizedHeight
                      ? `${item.originalWidth}×${item.originalHeight} → ${item.resizedWidth}×${item.resizedHeight}`
                      : `${item.originalWidth}×${item.originalHeight}`}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {formatBytes(item.originalSize)}
                    {item.resizedSize
                      ? ` → ${formatBytes(item.resizedSize)}`
                      : ''}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadOne(item)}
                      disabled={!item.resizedUrl}
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
