'use client'

import {Download, Image as ImageIcon, RefreshCw, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useEvent} from '@/hooks/use-event'
import {Button} from '../ui/button'
import {Checkbox} from '../ui/checkbox'
import {ColorPicker} from '../ui/color-picker'
import {Label} from '../ui/label'
import {SegmentedControl} from '../ui/segmented-control'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {Slider} from '../ui/slider'

type BackgroundMode = 'solid' | 'gradient' | 'transparent'
type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp'
type ExportScale = 1 | 1.5 | 2 | 3

const FRAME_BAR_HEIGHT = 32
const FRAME_BG_LIGHT = '#e8eaed'

const GRADIENT_PRESETS = {
  sunset: {from: '#ff7e5f', to: '#feb47b'},
  ocean: {from: '#2e3192', to: '#1bffff'},
  purple: {from: '#8e2de2', to: '#4a00e0'},
  night: {from: '#232526', to: '#414345'},
  cream: {from: '#f5f7fa', to: '#c3cfe2'},
  teal: {from: '#00b4db', to: '#0083b0'},
} as const

type PresetKey = keyof typeof GRADIENT_PRESETS

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
  ctx.lineTo(x + radius, y + h)
  ctx.arcTo(x, y + h, x, y + h - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

function makeLinearGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  angleDeg: number,
  from: string,
  to: string,
): CanvasGradient {
  const angle = (angleDeg - 90) * (Math.PI / 180)
  const cx = w / 2
  const cy = h / 2
  const len = Math.abs(w * Math.cos(angle)) + Math.abs(h * Math.sin(angle))
  const dx = (Math.cos(angle) * len) / 2
  const dy = (Math.sin(angle) * len) / 2
  const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  return g
}

function extForFormat(fmt: ExportFormat): string {
  if (fmt === 'image/png') return 'png'
  if (fmt === 'image/jpeg') return 'jpg'
  return 'webp'
}

export function ScreenshotBeautifierView() {
  const t = useTranslations('config.screenshot-beautifier')
  const tGlobal = useTranslations('global')

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>('')
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)

  const [padding, setPadding] = useState<number>(48)
  const [bgMode, setBgMode] = useState<BackgroundMode>('gradient')
  const [bgColor, setBgColor] = useState<string>('#f5f7fa')
  const [preset, setPreset] = useState<PresetKey>('ocean')
  const [gradientAngle, setGradientAngle] = useState<number>(135)
  const [gradientFrom, setGradientFrom] = useState<string>(
    GRADIENT_PRESETS.ocean.from,
  )
  const [gradientTo, setGradientTo] = useState<string>(
    GRADIENT_PRESETS.ocean.to,
  )

  const [radius, setRadius] = useState<number>(12)
  const [frameEnabled, setFrameEnabled] = useState<boolean>(true)
  const [frameDark, setFrameDark] = useState<boolean>(false)

  const [shadowEnabled, setShadowEnabled] = useState<boolean>(true)
  const [shadowBlur, setShadowBlur] = useState<number>(32)
  const [shadowOpacity, setShadowOpacity] = useState<number>(30)

  const [format, setFormat] = useState<ExportFormat>('image/png')
  const [quality, setQuality] = useState<number>(92)
  const [exportScale, setExportScale] = useState<ExportScale>(2)

  const [busy, setBusy] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isTransparent = bgMode === 'transparent'
  const hasImage = imageUrl !== null

  useEffect(() => {
    if (!isTransparent) return
    if (format === 'image/png') return
    // transparent supported only in PNG — fallback to solid white for jpeg/webp
  }, [isTransparent, format])

  // biome-ignore lint/correctness/useExhaustiveDependencies: Redraw on any setting change
  useEffect(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const pad = padding
    const contentW = img.naturalWidth
    const contentH = img.naturalHeight + (frameEnabled ? FRAME_BAR_HEIGHT : 0)

    const outW = contentW + pad * 2
    const outH = contentH + pad * 2

    // physical canvas size = logical × export scale
    canvas.width = Math.round(outW * exportScale)
    canvas.height = Math.round(outH * exportScale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(exportScale, exportScale)

    // 1) background
    const effectiveMode: BackgroundMode =
      bgMode === 'transparent' && format !== 'image/png' ? 'solid' : bgMode

    if (effectiveMode === 'solid') {
      ctx.fillStyle =
        bgMode === 'transparent' && format !== 'image/png' ? '#ffffff' : bgColor
      ctx.fillRect(0, 0, outW, outH)
    } else if (effectiveMode === 'gradient') {
      const g = makeLinearGradient(
        ctx,
        outW,
        outH,
        gradientAngle,
        gradientFrom,
        gradientTo,
      )
      ctx.fillStyle = g
      ctx.fillRect(0, 0, outW, outH)
    }
    // else: transparent — leave empty (canvas is already cleared)

    // 2) window / image container
    const winX = pad
    const winY = pad
    const winW = contentW
    const winH = contentH

    const frameBg = frameDark ? '#202124' : FRAME_BG_LIGHT
    const imageY = frameEnabled ? winY + FRAME_BAR_HEIGHT : winY

    // 2a) shadow under the window
    if (shadowEnabled) {
      ctx.save()
      ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity / 100})`
      ctx.shadowBlur = shadowBlur
      ctx.shadowOffsetY = Math.round(shadowBlur / 4)
      ctx.fillStyle = frameBg
      roundedRectPath(ctx, winX, winY, winW, winH, radius)
      ctx.fill()
      ctx.restore()
    }

    // 2b) window body
    ctx.save()
    roundedRectPath(ctx, winX, winY, winW, winH, radius)
    ctx.clip()

    ctx.fillStyle = frameBg
    ctx.fillRect(winX, winY, winW, winH)

    // 2c) macos-style dots
    if (frameEnabled) {
      const dotRadius = 6
      const dotGap = 8
      const dotY = winY + FRAME_BAR_HEIGHT / 2
      const startX = winX + 20
      const colors = ['#ff5f57', '#febc2e', '#28c840']
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(
          startX + i * (dotRadius * 2 + dotGap) + dotRadius,
          dotY,
          dotRadius,
          0,
          Math.PI * 2,
        )
        ctx.fillStyle = colors[i]
        ctx.fill()
      }
    }

    // 2d) image
    ctx.drawImage(img, winX, imageY, winW, img.naturalHeight)

    ctx.restore()
  }, [
    imageUrl,
    padding,
    radius,
    bgMode,
    bgColor,
    gradientFrom,
    gradientTo,
    gradientAngle,
    frameEnabled,
    frameDark,
    shadowEnabled,
    shadowBlur,
    shadowOpacity,
    format,
    exportScale,
  ])

  const loadFile = useEvent((file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      if (imageUrl) URL.revokeObjectURL(imageUrl)
      setImageUrl(url)
      setImageName(file.name)
      setImageWidth(img.naturalWidth)
      setImageHeight(img.naturalHeight)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
    }
    img.src = url
  })

  const clearAll = useEvent(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    imageRef.current = null
    setImageUrl(null)
    setImageName('')
    setImageWidth(0)
    setImageHeight(0)
  })

  const applyPreset = useEvent((key: PresetKey) => {
    setPreset(key)
    setGradientFrom(GRADIENT_PRESETS[key].from)
    setGradientTo(GRADIENT_PRESETS[key].to)
  })

  const handleDownload = useEvent(async () => {
    const canvas = canvasRef.current
    if (!canvas || !imageUrl) return
    setBusy(true)
    try {
      const mime = format
      const qualityArg = mime === 'image/png' ? undefined : quality / 100
      const blob: Blob | null = await new Promise(resolve =>
        canvas.toBlob(resolve, mime, qualityArg),
      )
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const base = imageName.replace(/\.[^.]+$/, '') || 'screenshot'
      a.href = url
      a.download = `${base}-beautified.${extForFormat(format)}`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 500)
    } finally {
      setBusy(false)
    }
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: imageUrl
  const previewStyle = useMemo(() => {
    const img = imageRef.current
    if (!img) return null
    const contentW = img.naturalWidth
    const contentH = img.naturalHeight + (frameEnabled ? FRAME_BAR_HEIGHT : 0)
    return {
      aspectRatio: `${contentW + padding * 2} / ${contentH + padding * 2}`,
    }
  }, [imageUrl, padding, frameEnabled])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* ───── Left: settings ───── */}
      <div className="min-w-0 flex-1 space-y-4 lg:max-w-md">
        {/* Dropzone / file */}
        {!hasImage ? (
          <label
            htmlFor="sb-input"
            onDrop={e => {
              e.preventDefault()
              const f = e.dataTransfer.files?.[0]
              if (f) loadFile(f)
            }}
            onDragOver={e => e.preventDefault()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed bg-card p-10 text-center transition hover:border-primary/40"
          >
            <ImageIcon className="h-9 w-9 text-muted-foreground" />
            <p className="font-semibold">{t('hints.drop')}</p>
            <p className="text-xs text-muted-foreground">
              {t('hints.dropSub')}
            </p>
            <input
              id="sb-input"
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) loadFile(f)
                e.target.value = ''
              }}
            />
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
              {/* biome-ignore lint/performance/noImgElement: blob preview */}
              <img
                src={imageUrl}
                alt=""
                className="max-h-full max-w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={imageName}>
                {imageName}
              </p>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {imageWidth}×{imageHeight}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => inputRef.current?.click()}
              aria-label={t('actions.replace')}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearAll}
              aria-label={tGlobal('clear')}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) loadFile(f)
                e.target.value = ''
              }}
            />
          </div>
        )}

        {/* Background mode */}
        <div className="rounded-2xl border bg-card p-4">
          <Label className="mb-3 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t('inputs.backgroundMode')}
          </Label>
          <SegmentedControl<BackgroundMode>
            name="sb-bg-mode"
            value={bgMode}
            onChange={setBgMode}
            options={[
              {value: 'solid', label: t('modes.solid')},
              {value: 'gradient', label: t('modes.gradient')},
              {value: 'transparent', label: t('modes.transparent')},
            ]}
          />

          {bgMode === 'solid' && (
            <div className="mt-4">
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                {t('inputs.color')}
              </Label>
              <ColorPicker
                value={bgColor}
                onChange={setBgColor}
                className="h-9 w-full"
              />
            </div>
          )}

          {bgMode === 'gradient' && (
            <>
              <div className="mt-4">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                  {t('inputs.gradientPreset')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(GRADIENT_PRESETS) as PresetKey[]).map(key => {
                    const p = GRADIENT_PRESETS[key]
                    const active = preset === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyPreset(key)}
                        aria-label={t(`presets.${key}`)}
                        title={t(`presets.${key}`)}
                        className={`h-8 w-12 rounded-lg border-2 transition ${
                          active
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-border hover:border-primary/40'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {t('inputs.gradientFrom')}
                  </Label>
                  <ColorPicker
                    value={gradientFrom}
                    onChange={v => {
                      setGradientFrom(v)
                    }}
                    className="h-9 w-full"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {t('inputs.gradientTo')}
                  </Label>
                  <ColorPicker
                    value={gradientTo}
                    onChange={v => {
                      setGradientTo(v)
                    }}
                    className="h-9 w-full"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('inputs.gradientAngle')}
                  </Label>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {gradientAngle}°
                  </span>
                </div>
                <Slider
                  value={[gradientAngle]}
                  onValueChange={v =>
                    setGradientAngle(Array.isArray(v) ? (v[0] ?? 135) : v)
                  }
                  min={0}
                  max={360}
                  step={5}
                />
              </div>
            </>
          )}

          {bgMode === 'transparent' && format !== 'image/png' && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              {t('hints.transparentJpeg')}
            </p>
          )}
        </div>

        {/* Padding + radius */}
        <div className="space-y-4 rounded-2xl border bg-card p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                {t('inputs.padding')}
              </Label>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {padding}px
              </span>
            </div>
            <Slider
              value={[padding]}
              onValueChange={v =>
                setPadding(Array.isArray(v) ? (v[0] ?? 48) : v)
              }
              min={0}
              max={200}
              step={4}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                {t('inputs.radius')}
              </Label>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {radius}px
              </span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={v =>
                setRadius(Array.isArray(v) ? (v[0] ?? 12) : v)
              }
              min={0}
              max={64}
              step={2}
            />
          </div>
        </div>

        {/* Frame + shadow */}
        <div className="space-y-4 rounded-2xl border bg-card p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={frameEnabled}
              onCheckedChange={c => setFrameEnabled(c === true)}
            />
            <span>{t('inputs.frame')}</span>
          </label>

          {frameEnabled && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={frameDark}
                onCheckedChange={c => setFrameDark(c === true)}
              />
              <span>{t('inputs.frameDark')}</span>
            </label>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={shadowEnabled}
              onCheckedChange={c => setShadowEnabled(c === true)}
            />
            <span>{t('inputs.shadow')}</span>
          </label>

          {shadowEnabled && (
            <div className="space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('inputs.shadowBlur')}
                  </Label>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {shadowBlur}px
                  </span>
                </div>
                <Slider
                  value={[shadowBlur]}
                  onValueChange={v =>
                    setShadowBlur(Array.isArray(v) ? (v[0] ?? 32) : v)
                  }
                  min={0}
                  max={96}
                  step={4}
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('inputs.shadowOpacity')}
                  </Label>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {shadowOpacity}%
                  </span>
                </div>
                <Slider
                  value={[shadowOpacity]}
                  onValueChange={v =>
                    setShadowOpacity(Array.isArray(v) ? (v[0] ?? 30) : v)
                  }
                  min={0}
                  max={80}
                  step={5}
                />
              </div>
            </div>
          )}
        </div>

        {/* Export settings */}
        <div className="space-y-4 rounded-2xl border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t('inputs.format')}
              </Label>
              <Select
                value={format}
                onValueChange={v => setFormat(v as ExportFormat)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t('inputs.scale')}
              </Label>
              <Select
                value={String(exportScale)}
                onValueChange={v => setExportScale(Number(v) as ExportScale)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1×</SelectItem>
                  <SelectItem value="1.5">1.5×</SelectItem>
                  <SelectItem value="2">2×</SelectItem>
                  <SelectItem value="3">3×</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {format !== 'image/png' && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t('inputs.quality')}
                </Label>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {quality}%
                </span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={v =>
                  setQuality(Array.isArray(v) ? (v[0] ?? 92) : v)
                }
                min={40}
                max={100}
                step={1}
              />
            </div>
          )}
        </div>
      </div>

      {/* ───── Right: preview ───── */}
      <div className="min-w-0 flex-1">
        <div className="rounded-3xl border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold">{t('sections.preview')}</span>
            <Button
              type="button"
              onClick={() => void handleDownload()}
              disabled={!hasImage || busy}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              {t('actions.download')}
            </Button>
          </div>

          <div
            className="flex items-center justify-center overflow-hidden rounded-2xl border bg-muted/20 p-4"
            style={{height: 560}}
          >
            {hasImage ? (
              <canvas
                ref={canvasRef}
                className="max-h-full max-w-full object-contain shadow-sm"
                style={previewStyle ?? undefined}
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                <ImageIcon className="mx-auto mb-2 h-6 w-6" />
                {t('hints.empty')}
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t('hints.privacy')}
          </p>
        </div>
      </div>
    </div>
  )
}
