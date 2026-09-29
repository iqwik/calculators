'use client'

import {
  Download,
  Image as ImageIcon,
  Trash2,
  Type,
  Upload,
  Wand2,
  X,
} from 'lucide-react'
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
import {Textarea} from '../ui/textarea'

type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'tile'

type WatermarkType = 'text' | 'logo' | 'both'

type Item = {
  id: string
  file: File
  originalUrl: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  watermarkedUrl?: string
  watermarkedSize?: number
}

type LogoAsset = {
  url: string
  bitmap: ImageBitmap
  width: number
  height: number
  name: string
}

const POSITIONS: Position[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'tile',
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

function computeAnchor(
  position: Position,
  canvasW: number,
  canvasH: number,
  markW: number,
  markH: number,
  padX: number,
  padY: number,
): {x: number; y: number} {
  const left = padX + markW / 2
  const centerX = canvasW / 2
  const right = canvasW - padX - markW / 2

  const top = padY + markH / 2
  const centerY = canvasH / 2
  const bottom = canvasH - padY - markH / 2

  switch (position) {
    case 'top-left':
      return {x: left, y: top}
    case 'top-center':
      return {x: centerX, y: top}
    case 'top-right':
      return {x: right, y: top}
    case 'middle-left':
      return {x: left, y: centerY}
    case 'center':
      return {x: centerX, y: centerY}
    case 'middle-right':
      return {x: right, y: centerY}
    case 'bottom-left':
      return {x: left, y: bottom}
    case 'bottom-center':
      return {x: centerX, y: bottom}
    case 'bottom-right':
      return {x: right, y: bottom}
    default:
      return {x: centerX, y: centerY}
  }
}

export function ImageWatermarkView() {
  const t = useTranslations('config.image-watermark')
  const tGlobal = useTranslations('global')

  const [items, setItems] = useState<Item[]>([])
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text')
  const [text, setText] = useState('© Your Brand')
  const [fontSize, setFontSize] = useState(5)
  const [textColor, setTextColor] = useState('#ffffff')
  const [opacity, setOpacity] = useState(70)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState<Position>('bottom-right')

  const [logo, setLogo] = useState<LogoAsset | null>(null)
  const [logoSize, setLogoSize] = useState(20)

  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const smoothProgress = useSmoothProgress(progress)

  const inputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const canRun = useMemo(() => {
    if (items.length === 0) return false
    if (watermarkType === 'text' && !text.trim()) return false
    if (watermarkType === 'logo' && !logo) return false
    if (watermarkType === 'both' && (!text.trim() || !logo)) return false
    return true
  }, [items.length, watermarkType, text, logo])

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

  const addLogo = useEvent(async (files: FileList | File[]) => {
    const file = Array.from(files).find(f => f.type.startsWith('image/'))
    if (!file) return
    try {
      const bitmap = await createImageBitmap(file)
      if (logo) URL.revokeObjectURL(logo.url)
      setLogo({
        url: URL.createObjectURL(file),
        bitmap,
        width: bitmap.width,
        height: bitmap.height,
        name: file.name,
      })
    } catch {
      // ignore
    }
  })

  const clearLogo = useEvent(() => {
    if (logo) {
      URL.revokeObjectURL(logo.url)
      logo.bitmap.close()
    }
    setLogo(null)
  })

  const watermarkAll = useEvent(async () => {
    setBusy(true)
    setProgress(0)

    const updated: Item[] = []
    const total = items.length

    for (let i = 0; i < total; i++) {
      const item = items[i]
      try {
        const bitmap = await createImageBitmap(item.file)
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          bitmap.close()
          updated.push(item)
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        ctx.drawImage(bitmap, 0, 0)

        const w = canvas.width
        const h = canvas.height
        const minSide = Math.min(w, h)
        const pad = Math.max(8, Math.round(minSide * 0.03))

        // Text watermark
        if (watermarkType === 'text' || watermarkType === 'both') {
          const fontPx = Math.max(10, Math.round((w * fontSize) / 100))
          ctx.save()
          ctx.globalAlpha = opacity / 100
          ctx.fillStyle = textColor
          ctx.font = `bold ${fontPx}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          const lines = text.split('\n').filter(Boolean)
          const lineHeight = fontPx * 1.2
          const blockH = lines.length * lineHeight
          const maxLineW = Math.max(
            ...lines.map(line => ctx.measureText(line).width),
            1,
          )

          if (position === 'tile') {
            const stepX = Math.max(maxLineW + pad * 2, minSide * 0.25)
            const stepY = Math.max(blockH + pad * 2, minSide * 0.2)
            const rad = (rotation * Math.PI) / 180
            for (let y = stepY / 2; y < h + stepY; y += stepY) {
              for (let x = stepX / 2; x < w + stepX; x += stepX) {
                ctx.save()
                ctx.translate(x, y)
                ctx.rotate(rad)
                lines.forEach((line, idx) => {
                  const oy = (idx - (lines.length - 1) / 2) * lineHeight
                  ctx.fillText(line, 0, oy)
                })
                ctx.restore()
              }
            }
          } else {
            const anchor = computeAnchor(
              position,
              w,
              h,
              maxLineW,
              blockH,
              pad,
              pad,
            )
            ctx.translate(anchor.x, anchor.y)
            ctx.rotate((rotation * Math.PI) / 180)
            lines.forEach((line, idx) => {
              const oy = (idx - (lines.length - 1) / 2) * lineHeight
              ctx.fillText(line, 0, oy)
            })
          }
          ctx.restore()
        }

        // Logo watermark
        if ((watermarkType === 'logo' || watermarkType === 'both') && logo) {
          const targetW = Math.max(16, Math.round((w * logoSize) / 100))
          const targetH = Math.round(
            (logo.bitmap.height * targetW) / logo.bitmap.width,
          )

          ctx.save()
          ctx.globalAlpha = opacity / 100

          if (position === 'tile') {
            const stepX = Math.max(targetW + pad * 2, minSide * 0.25)
            const stepY = Math.max(targetH + pad * 2, minSide * 0.2)
            const rad = (rotation * Math.PI) / 180
            for (let y = stepY / 2; y < h + stepY; y += stepY) {
              for (let x = stepX / 2; x < w + stepX; x += stepX) {
                ctx.save()
                ctx.translate(x, y)
                ctx.rotate(rad)
                ctx.drawImage(
                  logo.bitmap,
                  -targetW / 2,
                  -targetH / 2,
                  targetW,
                  targetH,
                )
                ctx.restore()
              }
            }
          } else {
            const anchor = computeAnchor(
              position,
              w,
              h,
              targetW,
              targetH,
              pad,
              pad,
            )
            ctx.translate(anchor.x, anchor.y)
            ctx.rotate((rotation * Math.PI) / 180)
            ctx.drawImage(
              logo.bitmap,
              -targetW / 2,
              -targetH / 2,
              targetW,
              targetH,
            )
          }
          ctx.restore()
        }

        bitmap.close()

        // PNG сохраняет прозрачность водяного знака; JPEG — нет
        const outputType =
          item.file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png'
        const blob: Blob | null = await new Promise(resolve =>
          canvas.toBlob(resolve, outputType, 0.92),
        )
        if (!blob) {
          updated.push(item)
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        if (item.watermarkedUrl) URL.revokeObjectURL(item.watermarkedUrl)

        updated.push({
          ...item,
          watermarkedUrl: URL.createObjectURL(blob),
          watermarkedSize: blob.size,
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
    if (!item.watermarkedUrl) return
    const ext = item.file.type === 'image/jpeg' ? 'jpg' : 'png'
    const a = document.createElement('a')
    a.href = item.watermarkedUrl
    a.download = `${stripExt(item.file.name)}-watermarked.${ext}`
    a.click()
  })

  const downloadAll = useEvent(async () => {
    for (const item of items) {
      if (item.watermarkedUrl) {
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
        if (target.watermarkedUrl) URL.revokeObjectURL(target.watermarkedUrl)
      }
      return prev.filter(i => i.id !== id)
    })
  })

  const clearAll = useEvent(() => {
    for (const i of items) {
      URL.revokeObjectURL(i.originalUrl)
      if (i.watermarkedUrl) URL.revokeObjectURL(i.watermarkedUrl)
    }
    setItems([])
  })

  const watermarkedCount = items.filter(i => i.watermarkedUrl).length
  const totalOriginal = items.reduce((s, i) => s + i.originalSize, 0)
  const totalWatermarked = items.reduce(
    (s, i) => s + (i.watermarkedSize ?? 0),
    0,
  )

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="image-watermark-input"
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card p-8 text-center transition hover:border-primary/40"
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t('hints.drop')}</p>
        <p className="text-xs text-muted-foreground">{t('hints.dropSub')}</p>
        <input
          id="image-watermark-input"
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground">
              {t('inputs.type')}
            </Label>
            <Select
              value={watermarkType}
              onValueChange={v => setWatermarkType(v as WatermarkType)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{t('types.text')}</SelectItem>
                <SelectItem value="logo">{t('types.logo')}</SelectItem>
                <SelectItem value="both">{t('types.both')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium tracking-wide text-muted-foreground">
              {t('inputs.position')}
            </Label>
            <Select
              value={position}
              onValueChange={v => setPosition(v as Position)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map(p => (
                  <SelectItem key={p} value={p}>
                    {t(`positions.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                {t('inputs.opacity')}
              </Label>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {opacity}%
              </span>
            </div>
            <Slider
              value={[opacity]}
              onValueChange={v =>
                setOpacity(Array.isArray(v) ? (v[0] ?? 70) : v)
              }
              min={10}
              max={100}
              step={1}
            />
          </div>
        </div>

        {(watermarkType === 'text' || watermarkType === 'both') && (
          <div className="mt-4 flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium tracking-wide text-muted-foreground">
                {t('sections.text')}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t('inputs.text')}
              </Label>
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={t('placeholders.text')}
                rows={2}
                className="resize-none font-mono"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('inputs.fontSize')}
                  </Label>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {fontSize}%
                  </span>
                </div>
                <Slider
                  value={[fontSize]}
                  onValueChange={v =>
                    setFontSize(Array.isArray(v) ? (v[0] ?? 5) : v)
                  }
                  min={1}
                  max={20}
                  step={1}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t('inputs.textColor')}
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="h-9 w-16 cursor-pointer rounded-md border bg-background"
                    aria-label={t('inputs.textColor')}
                  />
                  <Input
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="h-9 font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {(watermarkType === 'logo' || watermarkType === 'both') && (
          <div className="mt-4 flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium tracking-wide text-muted-foreground">
                  {t('sections.logo')}
                </span>
              </div>
              {logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearLogo}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  {tGlobal('clear')}
                </Button>
              )}
            </div>

            {logo ? (
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background p-1">
                  {/* biome-ignore lint/performance/noImgElement: blob logo preview */}
                  <img
                    src={logo.url}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{logo.name}</p>
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {logo.width}×{logo.height}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={e => {
                    if (e.target.files) void addLogo(e.target.files)
                    e.target.value = ''
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-fit"
                >
                  <Upload className="mr-1.5 h-4 w-4" />
                  {t('actions.uploadLogo')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t('hints.logoTransparency')}
                </p>
              </>
            )}

            {logo && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('inputs.logoSize')}
                  </Label>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {logoSize}%
                  </span>
                </div>
                <Slider
                  value={[logoSize]}
                  onValueChange={v =>
                    setLogoSize(Array.isArray(v) ? (v[0] ?? 20) : v)
                  }
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('inputs.rotation')}
            </Label>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {rotation}°
            </span>
          </div>
          <Slider
            value={[rotation]}
            onValueChange={v => setRotation(Array.isArray(v) ? (v[0] ?? 0) : v)}
            min={-180}
            max={180}
            step={5}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {t('stats.queue', {count: items.length})}
          </p>
          <Button
            type="button"
            onClick={() => void watermarkAll()}
            disabled={busy || !canRun}
            className="gap-1.5"
          >
            <Wand2 className="h-4 w-4" />
            {busy
              ? t('actions.applyingPercent', {percent: smoothProgress})
              : t('actions.applyAll')}
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
              {watermarkedCount > 0 && (
                <span>
                  {t('stats.watermarked')}:{' '}
                  <span className="font-mono text-foreground tabular-nums">
                    {formatBytes(totalWatermarked)}
                  </span>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadAll}
                disabled={watermarkedCount === 0}
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
                    src={item.watermarkedUrl ?? item.originalUrl}
                    alt={item.file.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {item.watermarkedUrl && (
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
                    {item.originalWidth}×{item.originalHeight}
                    {item.watermarkedSize
                      ? ` · ${formatBytes(item.watermarkedSize)}`
                      : ` · ${formatBytes(item.originalSize)}`}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadOne(item)}
                      disabled={!item.watermarkedUrl}
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
