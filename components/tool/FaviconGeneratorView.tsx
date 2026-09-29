'use client'

import JSZip from 'jszip'
import {Download, Image as ImageIcon, Loader2, Package} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useRef, useState} from 'react'
import {useEvent} from '@/hooks/use-event'
import {useSmoothProgress} from '@/hooks/use-smooth-progress'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {Label} from '../ui/label'
import {SegmentedControl} from '../ui/segmented-control'

type FitMode = 'contain' | 'cover' | 'stretch'

type GeneratedIcon = {
  size: number
  label: string
  blob: Blob
  url: string
}

const SIZES: {size: number; label: string; file: string}[] = [
  {size: 16, label: '16×16', file: 'favicon-16x16.png'},
  {size: 32, label: '32×32', file: 'favicon-32x32.png'},
  {size: 48, label: '48×48', file: 'favicon-48x48.png'},
  {size: 96, label: '96×96', file: 'favicon-96x96.png'},
  {size: 180, label: '180×180', file: 'apple-touch-icon.png'},
  {size: 192, label: '192×192', file: 'icon-192.png'},
  {size: 512, label: '512×512', file: 'icon-512.png'},
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function hexFromRgb(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function extractDominantColor(img: HTMLImageElement): string {
  try {
    const canvas = document.createElement('canvas')
    const maxSide = 64
    const scale = Math.min(
      1,
      maxSide / Math.max(img.naturalWidth, img.naturalHeight),
    )
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', {willReadFrequently: true})
    if (!ctx) return '#ffffff'
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data

    // Усредняем все непрозрачные пиксели
    let r = 0
    let g = 0
    let b = 0
    let n = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      n++
    }
    if (n === 0) return '#ffffff'
    return hexFromRgb(Math.round(r / n), Math.round(g / n), Math.round(b / n))
  } catch {
    return '#ffffff'
  }
}

function buildHtmlSnippet(): string {
  return [
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join('\n')
}

function buildManifest(themeColor: string): string {
  return JSON.stringify(
    {
      name: 'Your App',
      short_name: 'App',
      icons: [
        {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
        {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
      ],
      theme_color: themeColor,
      background_color: themeColor,
      display: 'standalone',
    },
    null,
    2,
  )
}

function buildReadme(themeColor: string): string {
  return [
    'Favicon + App Icon Set',
    '=====================',
    '',
    'Files included:',
    '  favicon-16x16.png',
    '  favicon-32x32.png',
    '  favicon-48x48.png',
    '  favicon-96x96.png',
    '  apple-touch-icon.png    (180×180, for iOS home screen)',
    '  icon-192.png            (PWA / Android)',
    '  icon-512.png            (PWA / Android)',
    '  site.webmanifest',
    '',
    'Usage — paste into the <head> of your HTML:',
    '',
    buildHtmlSnippet(),
    '',
    `Detected theme color: ${themeColor}`,
    '',
    'Copy all PNG files to the root of your site (or /public in Next.js / Vite).',
    'The site.webmanifest should also go to the root.',
  ].join('\n')
}

export function FaviconGeneratorView() {
  const t = useTranslations('config.favicon-generator')
  const tGlobal = useTranslations('global')

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fitMode, setFitMode] = useState<FitMode>('contain')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [icons, setIcons] = useState<GeneratedIcon[]>([])
  const [themeColor, setThemeColor] = useState('#ffffff')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const smoothProgress = useSmoothProgress(progress)

  const sourceImageRef = useRef<HTMLImageElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const generate = useEvent(async (img: HTMLImageElement) => {
    setBusy(true)
    setProgress(0)

    const generated: GeneratedIcon[] = []
    const total = SIZES.length

    for (let i = 0; i < total; i++) {
      const {size, label, file: _} = SIZES[i]
      try {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setProgress(Math.round(((i + 1) / total) * 100))
          continue
        }

        // Фон — только для JPEG-выхода (здесь всегда PNG, но всё равно
        // заливаем для случая stretch/contain с пустыми краями, если fitMode !== 'cover')
        if (fitMode !== 'cover') {
          ctx.fillStyle = backgroundColor
          ctx.fillRect(0, 0, size, size)
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        if (fitMode === 'stretch') {
          ctx.drawImage(img, 0, 0, size, size)
        } else {
          const srcAspect = img.naturalWidth / img.naturalHeight
          const dstAspect = 1

          if (fitMode === 'cover') {
            let sx = 0
            let sy = 0
            let sw = img.naturalWidth
            let sh = img.naturalHeight
            if (srcAspect > dstAspect) {
              sw = img.naturalHeight * dstAspect
              sx = (img.naturalWidth - sw) / 2
            } else {
              sh = img.naturalWidth / dstAspect
              sy = (img.naturalHeight - sh) / 2
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)
          } else {
            // contain — вписываем целиком
            const scale = Math.min(
              size / img.naturalWidth,
              size / img.naturalHeight,
            )
            const w = Math.round(img.naturalWidth * scale)
            const h = Math.round(img.naturalHeight * scale)
            const x = Math.round((size - w) / 2)
            const y = Math.round((size - h) / 2)
            ctx.drawImage(img, x, y, w, h)
          }
        }

        const blob: Blob | null = await new Promise(resolve =>
          canvas.toBlob(resolve, 'image/png'),
        )
        if (blob) {
          generated.push({
            size,
            label,
            blob,
            url: URL.createObjectURL(blob),
          })
        }
      } catch {
        // skip
      }

      setProgress(Math.round(((i + 1) / total) * 100))
    }

    // Освобождаем предыдущие URL
    for (const old of icons) URL.revokeObjectURL(old.url)

    setIcons(generated)
    setBusy(false)
    setProgress(0)
  })

  const handleFile = useEvent((files: FileList | File[]) => {
    const file = Array.from(files).find(f => f.type.startsWith('image/'))
    if (!file) return

    // Освобождаем предыдущий preview
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)

    const url = URL.createObjectURL(file)
    setImagePreview(url)

    const img = new Image()
    img.onload = () => {
      sourceImageRef.current = img
      setThemeColor(extractDominantColor(img))
      void generate(img)
    }
    img.src = url
  })

  const regenerate = useEvent(() => {
    const img = sourceImageRef.current
    if (!img) return
    void generate(img)
  })

  const clearAll = useEvent(() => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    for (const old of icons) URL.revokeObjectURL(old.url)
    sourceImageRef.current = null
    setImagePreview(null)
    setIcons([])
    setThemeColor('#ffffff')
  })

  const downloadZip = useEvent(async () => {
    if (icons.length === 0) return
    setBusy(true)
    setProgress(0)

    const zip = new JSZip()
    const total = icons.length
    for (let i = 0; i < total; i++) {
      const icon = icons[i]
      const meta = SIZES.find(s => s.size === icon.size)
      if (meta) zip.file(meta.file, icon.blob)
      setProgress(Math.round(((i + 1) / total) * 100))
    }

    zip.file('site.webmanifest', buildManifest(themeColor))
    zip.file('README.txt', buildReadme(themeColor))

    const blob = await zip.generateAsync({type: 'blob'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'favicon-set.zip'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 200)

    setBusy(false)
    setProgress(0)
  })

  const downloadOne = useEvent((icon: GeneratedIcon) => {
    const meta = SIZES.find(s => s.size === icon.size)
    if (!meta) return
    const a = document.createElement('a')
    a.href = icon.url
    a.download = meta.file
    a.click()
  })

  const htmlSnippet = buildHtmlSnippet()
  const manifestSnippet = buildManifest(themeColor)

  const totalSize = icons.reduce((s, i) => s + i.blob.size, 0)

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="favicon-input"
        onDrop={e => {
          e.preventDefault()
          if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files)
        }}
        onDragOver={e => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card p-8 text-center transition hover:border-primary/40"
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t('hints.drop')}</p>
        <p className="text-xs text-muted-foreground">{t('hints.dropSub')}</p>
        <input
          id="favicon-input"
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={e => {
            if (e.target.files) handleFile(e.target.files)
            e.target.value = ''
          }}
        />
      </label>

      {imagePreview && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex shrink-0 items-center justify-center rounded-lg bg-muted/40 p-3">
              {/* biome-ignore lint/performance/noImgElement: blob preview */}
              <img
                alt=""
                src={imagePreview}
                className="max-h-32 max-w-32 object-contain"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                  {t('inputs.fitMode')}
                </Label>
                <SegmentedControl<FitMode>
                  value={fitMode}
                  onChange={setFitMode}
                  name="fit-mode"
                  options={[
                    {value: 'contain', label: t('fitModes.contain')},
                    {value: 'cover', label: t('fitModes.cover')},
                    {value: 'stretch', label: t('fitModes.stretch')},
                  ]}
                />
                <p className="text-xs text-muted-foreground">
                  {t(`fitHints.${fitMode}`)}
                </p>
              </div>

              {fitMode !== 'cover' && (
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="favicon-bg"
                    className="text-xs font-medium tracking-wide text-muted-foreground"
                  >
                    {t('inputs.backgroundColor')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="favicon-bg"
                      type="color"
                      value={backgroundColor}
                      onChange={e => setBackgroundColor(e.target.value)}
                      className="h-9 w-16 cursor-pointer rounded-md border bg-background"
                    />
                    <span className="font-mono text-sm uppercase">
                      {backgroundColor}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('hints.backgroundColor')}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={regenerate}
                  disabled={busy}
                  variant="outline"
                  size="sm"
                >
                  {t('actions.regenerate')}
                </Button>
                <Button
                  type="button"
                  onClick={clearAll}
                  variant="ghost"
                  size="sm"
                >
                  {tGlobal('clear')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {icons.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              <span>
                {t('stats.icons')}:{' '}
                <span className="font-mono text-foreground tabular-nums">
                  {icons.length}
                </span>
              </span>
              <span>
                {t('stats.totalSize')}:{' '}
                <span className="font-mono text-foreground tabular-nums">
                  {formatBytes(totalSize)}
                </span>
              </span>
              <span>
                {t('stats.themeColor')}:{' '}
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-sm border"
                    style={{background: themeColor}}
                  />
                  <span className="font-mono text-foreground uppercase">
                    {themeColor}
                  </span>
                </span>
              </span>
            </div>
            <Button
              type="button"
              onClick={() => void downloadZip()}
              disabled={busy}
              className="gap-1.5"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              {busy
                ? t('actions.zippingPercent', {percent: smoothProgress})
                : t('actions.downloadZip')}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {icons.map(icon => (
              <div
                key={icon.size}
                className="flex flex-col overflow-hidden rounded-xl border bg-card"
              >
                <div className="flex aspect-square items-center justify-center bg-muted/40 p-2">
                  {/* biome-ignore lint/performance/noImgElement: blob preview */}
                  <img
                    src={icon.url}
                    alt={icon.label}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-1 p-2">
                  <p className="font-mono text-xs font-medium">{icon.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground tabular-nums">
                    {formatBytes(icon.blob.size)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadOne(icon)}
                    className="mt-1 h-6 gap-1 px-1.5 text-xs"
                  >
                    <Download className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="min-w-0 flex-1">
              <OutputPanel
                title={t('sections.html')}
                value={htmlSnippet}
                heightClass="max-h-[220px]"
              />
            </div>
            <div className="min-w-0 flex-1">
              <OutputPanel
                title={t('sections.manifest')}
                value={manifestSnippet}
                heightClass="max-h-[220px]"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
