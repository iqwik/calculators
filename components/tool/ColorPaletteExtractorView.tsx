'use client'

import {
  Check,
  Copy,
  Image as ImageIcon,
  Link2,
  Loader2,
  Upload,
  Wand2,
} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useRef, useState} from 'react'
import {extractPalette, type PaletteColor} from '@/helpers/utils/median-cut'
import {useEvent} from '@/hooks/use-event'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Label} from '../ui/label'
import {Slider} from '../ui/slider'

type SourceMode = 'file' | 'url'

function rgbToHsl(r: number, g: number, b: number): string {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h /= 6
  }

  return `${Math.round(h * 360)}° ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function buildCssVariables(palette: PaletteColor[]): string {
  return palette
    .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
    .join('\n')
    .replace(/^/, ':root {\n')
    .replace(/$/, '\n}')
}

function buildJson(palette: PaletteColor[]): string {
  return JSON.stringify(
    palette.map(c => ({
      hex: c.hex,
      rgb: {r: c.r, g: c.g, b: c.b},
      hsl: rgbToHsl(c.r, c.g, c.b),
      percentage: Number(c.percentage.toFixed(2)),
    })),
    null,
    2,
  )
}

function extractPixelsFromImage(img: HTMLImageElement): {
  pixels: {r: number; g: number; b: number}[]
  error: 'canvas' | 'cors' | 'noPixels' | null
} {
  const canvas = document.createElement('canvas')
  const maxSide = 400
  let w = img.naturalWidth
  let h = img.naturalHeight
  const scale = Math.min(1, maxSide / Math.max(w, h))
  w = Math.round(w * scale)
  h = Math.round(h * scale)
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', {willReadFrequently: true})
  if (!ctx) return {pixels: [], error: 'canvas'}
  ctx.drawImage(img, 0, 0, w, h)

  let data: ImageData
  try {
    data = ctx.getImageData(0, 0, w, h)
  } catch {
    return {pixels: [], error: 'cors'}
  }

  const pixels: {r: number; g: number; b: number}[] = []
  const step = 4 * 2
  for (let i = 0; i < data.data.length; i += step) {
    const r = data.data[i]
    const g = data.data[i + 1]
    const b = data.data[i + 2]
    const a = data.data[i + 3]
    if (a < 128) continue
    pixels.push({r, g, b})
  }

  if (pixels.length === 0) return {pixels: [], error: 'noPixels'}
  return {pixels, error: null}
}

export function ColorPaletteExtractorView() {
  const t = useTranslations('config.color-palette-extractor')
  const tGlobal = useTranslations('global')

  const [mode, setMode] = useState<SourceMode>('file')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [palette, setPalette] = useState<PaletteColor[]>([])
  const [count, setCount] = useState(6)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const loadedImageRef = useRef<HTMLImageElement | null>(null)
  const pixelsRef = useRef<{r: number; g: number; b: number}[]>([])

  const extractFromImage = useEvent(
    (img: HTMLImageElement, requestedCount: number) => {
      const {pixels, error: pxError} = extractPixelsFromImage(img)
      if (pxError) {
        setError(t(`errors.${pxError}`))
        return
      }
      pixelsRef.current = pixels
      const result = extractPalette(pixels, requestedCount)
      setPalette(result)
      setError(null)
    },
  )

  const runExtraction = useEvent((requestedCount: number) => {
    const img = loadedImageRef.current
    if (!img) return
    setBusy(true)

    setTimeout(() => {
      extractFromImage(img, requestedCount)
      setBusy(false)
    }, 30)
  })

  const handleFile = useEvent((files: FileList | File[]) => {
    const file = Array.from(files).find(f => f.type.startsWith('image/'))
    if (!file) return
    setBusy(true)
    setError(null)
    setPalette([])

    const url = URL.createObjectURL(file)
    setImagePreview(url)

    const img = new Image()
    img.onload = () => {
      loadedImageRef.current = img
      pixelsRef.current = []
      extractFromImage(img, count)
      setBusy(false)
    }
    img.onerror = () => {
      setError(t('errors.load'))
      setBusy(false)
    }
    img.src = url
  })

  const handleUrl = useEvent(() => {
    if (!imageUrl.trim()) return
    setBusy(true)
    setError(null)
    setPalette([])

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      loadedImageRef.current = img
      pixelsRef.current = []
      setImagePreview(imageUrl)
      extractFromImage(img, count)
      setBusy(false)
    }
    img.onerror = () => {
      setError(t('errors.cors'))
      setBusy(false)
    }
    img.src = imageUrl
  })

  const clearAll = useEvent(() => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    loadedImageRef.current = null
    pixelsRef.current = []
    setImagePreview(null)
    setPalette([])
    setImageUrl('')
    setError(null)
  })

  const copyHex = useEvent(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopiedHex(hex)
      setTimeout(() => setCopiedHex(null), 1500)
    } catch {
      // clipboard недоступен
    }
  })

  const cssValue = palette.length > 0 ? buildCssVariables(palette) : ''
  const jsonValue = palette.length > 0 ? buildJson(palette) : ''

  const downloadTxt = useEvent((content: string, filename: string) => {
    const blob = new Blob([content], {type: 'text/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 100)
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium tracking-wide text-muted-foreground">
            {t('inputs.source')}
          </Label>
          <div className="inline-flex flex-wrap items-center gap-0.5 rounded-md bg-muted p-0.5 text-muted-foreground">
            {(['file', 'url'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-sm px-3 py-1 text-xs font-medium transition ${
                  mode === m
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:text-foreground'
                }`}
              >
                {t(`sources.${m}`)}
              </button>
            ))}
          </div>
        </div>

        {mode === 'file' ? (
          <label
            htmlFor="palette-input"
            className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-background p-6 text-center transition hover:border-primary/40"
          >
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium">{t('hints.drop')}</p>
            <p className="text-xs text-muted-foreground">
              {t('hints.dropSub')}
            </p>
            <input
              id="palette-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={e => {
                if (e.target.files) handleFile(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            <Label
              htmlFor="palette-url"
              className="text-xs font-medium text-muted-foreground"
            >
              {t('inputs.url')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="palette-url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-9"
              />
              <Button
                type="button"
                onClick={handleUrl}
                disabled={busy || !imageUrl.trim()}
                className="shrink-0"
              >
                <Link2 className="mr-1.5 h-4 w-4" />
                {t('actions.load')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t('hints.cors')}</p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('inputs.count')}
            </Label>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {count}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[count]}
              onValueChange={v => setCount(Array.isArray(v) ? (v[0] ?? 6) : v)}
              min={3}
              max={12}
              step={1}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => runExtraction(count)}
              disabled={busy || !loadedImageRef.current}
              className="shrink-0 gap-1.5"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {busy ? t('actions.extracting') : t('actions.reExtract')}
            </Button>
          </div>
        </div>
      </div>

      {imagePreview && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                {t('sections.preview')}
              </p>
              <div className="flex max-h-48 items-center justify-center overflow-hidden rounded-lg bg-muted/40 p-2">
                {/* biome-ignore lint/performance/noImgElement: blob preview */}
                <img
                  src={imagePreview}
                  alt=""
                  className="max-h-44 max-w-full object-contain"
                />
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
              {tGlobal('clear')}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {palette.length > 0 && (
        <>
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground">
              {t('sections.palette')}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {palette.map(color => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => void copyHex(color.hex)}
                  className="group flex flex-col overflow-hidden rounded-lg border bg-background transition hover:border-primary/40"
                >
                  <div
                    role="img"
                    aria-label={color.hex}
                    className="h-20 w-full"
                    style={{background: color.hex}}
                  />
                  <div className="flex flex-col items-start gap-0.5 px-2 py-1.5">
                    <span className="flex items-center gap-1 font-mono text-xs font-medium uppercase">
                      {color.hex}
                      {copiedHex === color.hex ? (
                        <Check className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-0 transition group-hover:opacity-50" />
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                      {color.percentage.toFixed(1)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground">
              {t('sections.details')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-3 font-medium">HEX</th>
                    <th className="py-2 pr-3 font-medium">RGB</th>
                    <th className="py-2 pr-3 font-medium">HSL</th>
                    <th className="py-2 pr-3 font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {palette.map(color => (
                    <tr key={color.hex} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-sm border"
                            style={{background: color.hex}}
                          />
                          <span className="uppercase">{color.hex}</span>
                        </span>
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {color.r}, {color.g}, {color.b}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {rgbToHsl(color.r, color.g, color.b)}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">
                        {color.percentage.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="min-w-0 flex-1">
              <OutputPanel
                title={t('sections.css')}
                value={cssValue}
                heightClass="max-h-[300px]"
                onDownload={() => downloadTxt(cssValue, 'palette.css')}
              />
            </div>
            <div className="min-w-0 flex-1">
              <OutputPanel
                title={t('sections.json')}
                value={jsonValue}
                heightClass="max-h-[300px]"
                onDownload={() => downloadTxt(jsonValue, 'palette.json')}
              />
            </div>
          </div>
        </>
      )}

      {!imagePreview && !error && (
        <div className="rounded-xl border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          <Upload className="mx-auto mb-2 h-6 w-6" />
          {t('hints.empty')}
        </div>
      )}
    </div>
  )
}
