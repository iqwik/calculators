'use client'

import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Printer,
  RotateCcw,
  RotateCw,
  Trash2,
  X,
} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useMemo, useRef, useState} from 'react'
import {useEvent} from '@/hooks/use-event'
import {Button} from '../ui/button'
import {Checkbox} from '../ui/checkbox'
import {ColorPicker} from '../ui/color-picker'
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

type PageSize = 'A4' | 'Letter' | 'Legal' | 'A5'
type Orientation = 'portrait' | 'landscape'
type FitMode = 'contain' | 'cover' | 'stretch'
type Rotation = 0 | 90 | 180 | 270

interface Item {
  id: string
  file: File
  url: string
  width: number
  height: number
  rotation: Rotation
}

// mm → px для экранного preview (96 dpi). Для print используем mm напрямую.
const MM_TO_PX = 96 / 25.4

const PAGE_SIZES_MM: Record<PageSize, [number, number]> = {
  A4: [210, 297],
  Letter: [215.9, 279.4],
  Legal: [215.9, 355.6],
  A5: [148, 210],
}

interface Layout {
  /** кол-во картинок на странице = columns * rows */
  perPage: number
  columns: 1 | 2 | 3
  rows: number
}

function computeLayout(
  pageSize: PageSize,
  orientation: Orientation,
  columns: 1 | 2 | 3,
  margin: number,
  gap: number,
): Layout {
  const [wMm, hMm] = PAGE_SIZES_MM[pageSize]
  const pageW = orientation === 'portrait' ? wMm : hMm
  const pageH = orientation === 'portrait' ? hMm : wMm
  const innerW = pageW - margin * 2
  const innerH = pageH - margin * 2
  const cellW = (innerW - gap * (columns - 1)) / columns
  const cellH = cellW * 0.75
  const rows = Math.max(1, Math.floor((innerH + gap) / (cellH + gap)))
  return {perPage: columns * rows, columns, rows}
}

async function loadImageSize(
  file: File,
): Promise<{width: number; height: number}> {
  const bitmap = await createImageBitmap(file)
  const {width, height} = bitmap
  bitmap.close()
  return {width, height}
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function ImagesToPdfView() {
  const t = useTranslations('config.images-to-pdf')
  const tGlobal = useTranslations('global')

  const [items, setItems] = useState<Item[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('A4')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [columns, setColumns] = useState<1 | 2 | 3>(1)
  const [margin, setMargin] = useState<number>(5)
  const [fitMode, setFitMode] = useState<FitMode>('contain')
  const [imageQuality, setImageQuality] = useState<number>(100)
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff')
  const [pageNumbers, setPageNumbers] = useState(false)
  const [captions, setCaptions] = useState(false)

  const gap = 2
  const inputRef = useRef<HTMLInputElement>(null)

  const layout = useMemo(
    () => computeLayout(pageSize, orientation, columns, margin, gap),
    [pageSize, orientation, columns, margin],
  )

  const pages = useMemo(() => {
    const result: Item[][] = []
    for (let i = 0; i < items.length; i += layout.perPage) {
      result.push(items.slice(i, i + layout.perPage))
    }
    return result
  }, [items, layout.perPage])

  const addFiles = useEvent(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    const added: Item[] = []
    for (const file of arr) {
      try {
        const {width, height} = await loadImageSize(file)
        const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`
        added.push({
          id,
          file,
          url: URL.createObjectURL(file),
          width,
          height,
          rotation: 0,
        })
      } catch {
        // skip broken
      }
    }
    setItems(prev => [...prev, ...added])
  })

  const onDrop = useEvent((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) void addFiles(e.dataTransfer.files)
  })

  const removeItem = useEvent((id: string) => {
    setItems(prev => {
      const target = prev.find(i => i.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter(i => i.id !== id)
    })
  })

  const clearAll = useEvent(() => {
    for (const i of items) URL.revokeObjectURL(i.url)
    setItems([])
  })

  const rotateLeft = useEvent((id: string) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? {...i, rotation: ((i.rotation + 270) % 360) as Rotation}
          : i,
      ),
    )
  })

  const rotateRight = useEvent((id: string) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? {...i, rotation: ((i.rotation + 90) % 360) as Rotation}
          : i,
      ),
    )
  })

  const moveUp = useEvent((id: string) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  })

  const moveDown = useEvent((id: string) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
      return next
    })
  })

  const [wMm, hMm] = PAGE_SIZES_MM[pageSize]
  const pageWmm = orientation === 'portrait' ? wMm : hMm
  const pageHmm = orientation === 'portrait' ? hMm : wMm
  const pageWpx = Math.round(pageWmm * MM_TO_PX)
  const pageHpx = Math.round(pageHmm * MM_TO_PX)

  const handlePrint = useEvent(() => {
    if (pages.length === 0) return

    const pageSizeCss = pageSize.toLowerCase() // a4, letter, legal, a5

    const pagesHtml = pages
      .map((slice, pageIdx) => {
        const rowCount = Math.max(1, Math.ceil(slice.length / columns))
        const cells = slice
          .map(item => {
            const caption = captions
              ? `<div class="cap">${escapeHtml(item.file.name)}</div>`
              : ''
            return `<div class="cell"><img src="${item.url}" style="transform:rotate(${item.rotation}deg)" alt="" />${caption}</div>`
          })
          .join('')
        const num = pageNumbers ? `<div class="num">${pageIdx + 1}</div>` : ''
        return `<div class="page" style="grid-template-rows:repeat(${rowCount}, 1fr)">${cells}${num}</div>`
      })
      .join('')

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>images.pdf</title>
<style>
  @page { size: ${pageSizeCss} ${orientation}; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .page {
    width: ${pageWmm}mm;
    height: ${pageHmm}mm;
    padding: ${margin}mm;
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: ${gap}mm;
    background: ${backgroundColor};
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 0;
    overflow: hidden;
  }
  .cell img {
    max-width: 100%;
    max-height: 100%;
    object-fit: ${fitMode === 'stretch' ? 'fill' : fitMode};
    display: block;
  }
  .cap {
    margin-top: 1mm;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 8pt;
    color: #6b7280;
    text-align: center;
    font-family: sans-serif;
  }
  .num {
    position: absolute;
    right: 2mm;
    bottom: 2mm;
    font-size: 8pt;
    color: #6b7280;
    font-family: monospace;
  }
</style>
</head>
<body>${pagesHtml}</body>
</html>`

    const iframe = document.createElement('iframe')
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: '0',
      visibility: 'hidden',
    })

    document.body.appendChild(iframe)

    const doc = iframe.contentDocument
    if (!doc) {
      iframe.remove()
      return
    }

    doc.open()
    doc.write(html)
    doc.close()

    const imgs = Array.from(doc.images) as HTMLImageElement[]
    const wait = Promise.all(
      imgs.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(resolve => {
              img.addEventListener('load', () => resolve(), {once: true})
              img.addEventListener('error', () => resolve(), {once: true})
            }),
      ),
    )

    void wait.then(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => iframe.remove(), 1500)
    })
  })

  return (
    <div className="space-y-6">
      {/* ─────────── Dropzone ─────────── */}
      <label
        htmlFor="images-to-pdf-input"
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed bg-card p-10 text-center transition hover:border-primary/40"
      >
        <ImageIcon className="h-9 w-9 text-muted-foreground" />
        <p className="font-semibold">{t('hints.drop')}</p>
        <p className="text-xs text-muted-foreground">{t('hints.dropSub')}</p>
        <input
          id="images-to-pdf-input"
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

      {/* ─────────── Files list ─────────── */}
      {items.length > 0 && (
        <div className="rounded-3xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold">
              {t('stats.filesWithHint', {count: items.length})}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-destructive hover:opacity-80"
            >
              <X className="h-3.5 w-3.5" />
              {tGlobal('clear')}
            </button>
          </div>

          <div className="max-h-72 space-y-2 overflow-auto pr-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border bg-background p-2"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
                  {/* biome-ignore lint/performance/noImgElement: blob preview */}
                  <img
                    src={item.url}
                    alt=""
                    className="max-h-full max-w-full object-cover"
                    style={{transform: `rotate(${item.rotation}deg)`}}
                  />
                </div>
                <div className="min-w-0 flex-1 truncate font-mono text-sm">
                  {item.file.name}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => rotateLeft(item.id)}
                    title={t('actions.rotateLeft')}
                    aria-label={t('actions.rotateLeft')}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateRight(item.id)}
                    title={t('actions.rotateRight')}
                    aria-label={t('actions.rotateRight')}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveUp(item.id)}
                    disabled={idx === 0}
                    aria-label={t('actions.moveUp')}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(item.id)}
                    disabled={idx === items.length - 1}
                    aria-label={t('actions.moveDown')}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={t('actions.remove')}
                    className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────── Options ─────────── */}
      <div className="rounded-3xl border bg-card p-6">
        <div className="mb-4 font-semibold">{t('sections.options')}</div>

        <div className="grid grid-cols-1 gap-5 text-sm md:grid-cols-3">
          {/* Page size */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t('inputs.pageSize')}
            </Label>
            <Select
              value={pageSize}
              onValueChange={v => setPageSize(v as PageSize)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210×297 mm)</SelectItem>
                <SelectItem value="Letter">US Letter (8.5×11 in)</SelectItem>
                <SelectItem value="Legal">US Legal (8.5×14 in)</SelectItem>
                <SelectItem value="A5">A5 (148×210 mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orientation */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t('inputs.orientation')}
            </Label>
            <div className="mt-1 flex gap-2">
              <Button
                type="button"
                variant={orientation === 'portrait' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setOrientation('portrait')}
              >
                {t('options.portrait')}
              </Button>
              <Button
                type="button"
                variant={orientation === 'landscape' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setOrientation('landscape')}
              >
                {t('options.landscape')}
              </Button>
            </div>
          </div>

          {/* Margin */}
          <div>
            <Label
              htmlFor="pdf-margin"
              className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {t('inputs.margin')} (mm)
            </Label>
            <Input
              id="pdf-margin"
              type="number"
              min={0}
              max={50}
              value={margin}
              onChange={e =>
                setMargin(
                  Math.max(0, Math.min(50, Number(e.target.value) || 0)),
                )
              }
              className="h-9"
            />
          </div>

          {/* Fit mode */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t('inputs.fitMode')}
            </Label>
            <Select
              value={fitMode}
              onValueChange={v => setFitMode(v as FitMode)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">{t('options.contain')}</SelectItem>
                <SelectItem value="cover">{t('options.cover')}</SelectItem>
                <SelectItem value="stretch">{t('options.stretch')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Background */}
          <div>
            <Label
              htmlFor="pdf-bg"
              className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {t('inputs.background')}
            </Label>
            <ColorPicker
              id="pdf-bg"
              value={backgroundColor}
              onChange={setBackgroundColor}
              className="h-9 w-full cursor-pointer rounded-lg border bg-background p-1"
            />
          </div>

          {/* Page numbers */}
          <div className="flex items-end pb-1.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={pageNumbers}
                onCheckedChange={c => setPageNumbers(c === true)}
              />
              <span>{t('inputs.pageNumbers')}</span>
            </label>
          </div>

          {/* Columns */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t('inputs.columns')}
            </Label>
            <div className="mt-1 flex gap-2">
              {([1, 2, 3] as const).map(c => (
                <Button
                  key={c}
                  type="button"
                  variant={columns === c ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setColumns(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {/* Captions */}
          <div className="flex items-end pb-1.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={captions}
                onCheckedChange={c => setCaptions(c === true)}
              />
              <span>{t('inputs.captions')}</span>
            </label>
          </div>

          {/* Quality */}
          <div className="md:col-span-3">
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t('inputs.quality')} ({imageQuality}%)
              </Label>
            </div>
            <Slider
              value={[imageQuality]}
              onValueChange={v =>
                setImageQuality(Array.isArray(v) ? (v[0] ?? 100) : v)
              }
              min={50}
              max={100}
              step={5}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('hints.quality')}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────── Preview ─────────── */}
      {items.length > 0 && (
        <div className="rounded-3xl border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold">
              {t('sections.preview')} ({pages.length}{' '}
              {pages.length === 1 ? t('stats.page') : t('stats.pages')})
            </span>
            <Button type="button" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              {t('actions.print')}
            </Button>
          </div>

          <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
            {pages.map((slice, pageIdx) => {
              const rowCount = Math.max(1, Math.ceil(slice.length / columns))
              return (
                <PreviewPage key={pageIdx} pageWpx={pageWpx} pageHpx={pageHpx}>
                  <div
                    className="relative overflow-hidden border bg-white shadow-md"
                    style={{
                      width: `${pageWpx}px`,
                      height: `${pageHpx}px`,
                      background: backgroundColor,
                      display: 'grid',
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gridTemplateRows: `repeat(${rowCount}, 1fr)`,
                      gap: `${gap}mm`,
                      padding: `${margin}mm`,
                    }}
                  >
                    {slice.map(item => (
                      <div
                        key={item.id}
                        className="flex min-h-0 flex-col items-center justify-center overflow-hidden"
                      >
                        {/* biome-ignore lint/performance/noImgElement: blob preview */}
                        <img
                          src={item.url}
                          alt=""
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: fitMode === 'stretch' ? 'fill' : fitMode,
                            transform: `rotate(${item.rotation}deg)`,
                            display: 'block',
                          }}
                        />
                        {captions && (
                          <div className="mt-0.5 max-w-full truncate px-0.5 text-[8px] text-gray-500">
                            {item.file.name}
                          </div>
                        )}
                      </div>
                    ))}
                    {pageNumbers && (
                      <div className="pointer-events-none absolute right-1 bottom-1 rounded bg-white/70 px-1 font-mono text-[8px] text-gray-500">
                        {pageIdx + 1}
                      </div>
                    )}
                  </div>
                </PreviewPage>
              )
            })}
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t('hints.previewNote')}
          </p>
        </div>
      )}
    </div>
  )
}

function PreviewPage({
  pageWpx,
  pageHpx,
  children,
}: {
  pageWpx: number
  pageHpx: number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const compute = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w <= 0 || h <= 0) return
      const s = Math.min(w / pageWpx, h / pageHpx)
      setScale(s)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pageWpx, pageHpx])

  return (
    <div
      ref={ref}
      className="flex w-full items-center justify-center overflow-hidden"
      style={{height: 560}}
    >
      {scale > 0 && (
        <div
          style={{
            width: pageWpx * scale,
            height: pageHpx * scale,
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <div
            style={{
              width: pageWpx,
              height: pageHpx,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
