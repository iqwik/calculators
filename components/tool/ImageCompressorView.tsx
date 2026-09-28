'use client'

import {Download, ImagePlus, Trash2, X} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useRef, useState} from 'react'
import {Button} from '../ui/button'
import {Slider} from '../ui/slider'

type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png'

interface CompressedImage {
  id: string
  file: File
  originalSize: number
  originalUrl: string
  compressedSize: number
  compressedUrl: string
  width: number
  height: number
  outputWidth: number
  outputHeight: number
  format: OutputFormat
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

async function compressImage(
  file: File,
  maxWidth: number,
  quality: number,
  format: OutputFormat,
): Promise<CompressedImage> {
  const originalUrl = URL.createObjectURL(file)
  const img = await loadImage(originalUrl)

  let outWidth = img.naturalWidth
  let outHeight = img.naturalHeight

  if (outWidth > maxWidth) {
    outHeight = Math.round((img.naturalHeight * maxWidth) / outWidth)
    outWidth = maxWidth
  }

  const canvas = document.createElement('canvas')
  canvas.width = outWidth
  canvas.height = outHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot get canvas context')

  // PNG не поддерживает фон при прозрачности — флэт белый
  if (format !== 'image/png') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outWidth, outHeight)
  }
  ctx.drawImage(img, 0, 0, outWidth, outHeight)

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      format,
      quality,
    )
  })

  const compressedUrl = URL.createObjectURL(blob)

  return {
    id: crypto.randomUUID(),
    file,
    originalSize: file.size,
    originalUrl,
    compressedSize: blob.size,
    compressedUrl,
    width: img.naturalWidth,
    height: img.naturalHeight,
    outputWidth: outWidth,
    outputHeight: outHeight,
    format,
  }
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

export function ImageCompressorView() {
  const t = useTranslations('config')

  const [items, setItems] = useState<CompressedImage[]>([])
  const [processing, setProcessing] = useState(false)
  const [dragging, setDragging] = useState(false)

  const [maxWidth, setMaxWidth] = useState(1920)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<OutputFormat>('image/jpeg')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      for (const item of items) {
        URL.revokeObjectURL(item.originalUrl)
        URL.revokeObjectURL(item.compressedUrl)
      }
    }
  }, [items])

  async function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter(f =>
      f.type.startsWith('image/'),
    )
    if (imageFiles.length === 0) return

    setProcessing(true)
    try {
      const next: CompressedImage[] = []
      for (const file of imageFiles) {
        try {
          const result = await compressImage(
            file,
            maxWidth,
            quality / 100,
            format,
          )
          next.push(result)
        } catch {
          // пропускаем невалидные файлы
        }
      }
      setItems(prev => [...prev, ...next])
    } finally {
      setProcessing(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
  }

  function removeItem(id: string) {
    setItems(prev => {
      const item = prev.find(i => i.id === id)
      if (item) {
        URL.revokeObjectURL(item.originalUrl)
        URL.revokeObjectURL(item.compressedUrl)
      }
      return prev.filter(i => i.id !== id)
    })
  }

  function downloadItem(item: CompressedImage) {
    const ext =
      item.format === 'image/jpeg'
        ? 'jpg'
        : item.format === 'image/webp'
          ? 'webp'
          : 'png'
    const baseName = item.file.name.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = item.compressedUrl
    a.download = `${baseName}-compressed.${ext}`
    a.click()
  }

  function downloadAll() {
    for (const item of items) {
      downloadItem(item)
    }
  }

  const totalOriginal = items.reduce((s, i) => s + i.originalSize, 0)
  const totalCompressed = items.reduce((s, i) => s + i.compressedSize, 0)
  const totalReduction = reduction(totalOriginal, totalCompressed)

  return (
    <div className="space-y-5">
      {/* Settings */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {t('image-compressor.maxWidth')}
              </label>
              <span className="text-xs text-muted-foreground">
                {maxWidth}px
              </span>
            </div>
            <Slider
              value={[maxWidth]}
              min={320}
              max={4000}
              step={80}
              onValueChange={v => setMaxWidth(Array.isArray(v) ? v[0] : v)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {t('image-compressor.quality')}
              </label>
              <span className="text-xs text-muted-foreground">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              min={10}
              max={100}
              step={5}
              onValueChange={v => setQuality(Array.isArray(v) ? v[0] : v)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('image-compressor.format')}
            </label>
            <div className="inline-flex items-center rounded-md bg-muted p-0.5 text-muted-foreground">
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
          {t('image-compressor.settingsHint')}
        </p>
      </div>

      {/* Dropzone */}
      <button
        type="button"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/40'
        }`}
      >
        <ImagePlus className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t('image-compressor.dropzone')}</p>
        <p className="text-xs text-muted-foreground">
          {t('image-compressor.dropzoneHint')}
        </p>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => {
          if (e.target.files) handleFiles(e.target.files)
          e.target.value = ''
        }}
        className="hidden"
      />

      {processing && (
        <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {t('image-compressor.processing')}
        </div>
      )}

      {/* Results */}
      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div className="text-sm">
              <span className="text-muted-foreground">
                {items.length} {t('image-compressor.files')}
              </span>
              <span className="mx-2">·</span>
              <span className="text-muted-foreground">
                {formatBytes(totalOriginal)} → {formatBytes(totalCompressed)}
              </span>
              {totalReduction > 0 && (
                <>
                  <span className="mx-2">·</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    −{totalReduction}%
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadAll}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {t('image-compressor.downloadAll')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems([])}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                {t('common.clear')}
              </Button>
            </div>
          </div>

          <ul className="space-y-3">
            {items.map(item => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border bg-card p-4"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/40">
                  {/* biome-ignore lint/performance/noImgElement: preview thumbnails */}
                  <img
                    src={item.compressedUrl}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.width}×{item.height} → {item.outputWidth}×
                    {item.outputHeight}
                    <span className="mx-1.5">·</span>
                    {formatBytes(item.originalSize)} →{' '}
                    {formatBytes(item.compressedSize)}
                    <span className="mx-1.5">·</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      −{reduction(item.originalSize, item.compressedSize)}%
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadItem(item)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive"
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
        {t('image-compressor.privacyNote')}
      </p>
    </div>
  )
}
