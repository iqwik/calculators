export interface RGB {
  r: number
  g: number
  b: number
}

export interface PaletteColor extends RGB {
  hex: string
  percentage: number
}

type Box = {
  pixels: RGB[]
  min: RGB
  max: RGB
}

function computeBounds(pixels: RGB[]): {min: RGB; max: RGB} {
  let minR = 255
  let minG = 255
  let minB = 255
  let maxR = 0
  let maxG = 0
  let maxB = 0
  for (const p of pixels) {
    if (p.r < minR) minR = p.r
    if (p.g < minG) minG = p.g
    if (p.b < minB) minB = p.b
    if (p.r > maxR) maxR = p.r
    if (p.g > maxG) maxG = p.g
    if (p.b > maxB) maxB = p.b
  }
  return {
    min: {r: minR, g: minG, b: minB},
    max: {r: maxR, g: maxG, b: maxB},
  }
}

function splitBox(box: Box): [Box, Box] {
  const dr = box.max.r - box.min.r
  const dg = box.max.g - box.min.g
  const db = box.max.b - box.min.b

  let axis: 'r' | 'g' | 'b' = 'r'
  if (dg >= dr && dg >= db) axis = 'g'
  else if (db >= dr && db >= dg) axis = 'b'

  const sorted = [...box.pixels].sort((a, b) => a[axis] - b[axis])
  const mid = Math.floor(sorted.length / 2)

  const a = sorted.slice(0, mid)
  const b = sorted.slice(mid)

  const boundsA = computeBounds(a)
  const boundsB = computeBounds(b)

  return [
    {pixels: a, min: boundsA.min, max: boundsA.max},
    {pixels: b, min: boundsB.min, max: boundsB.max},
  ]
}

function averageColor(pixels: RGB[]): RGB {
  let r = 0
  let g = 0
  let b = 0
  for (const p of pixels) {
    r += p.r
    g += p.g
    b += p.b
  }
  const n = pixels.length || 1
  return {
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
  }
}

function toHex({r, g, b}: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function colorDistance(a: RGB, b: RGB): number {
  const rMean = (a.r + b.r) / 2
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr +
      4 * dg * dg +
      (2 + (255 - rMean) / 256) * db * db,
  )
}

export function extractPalette(
  pixels: RGB[],
  count: number,
  mergeThreshold = 25,
  onProgress?: (p: number) => void,
): PaletteColor[] {
  if (pixels.length === 0 || count <= 0) {
    onProgress?.(100)
    return []
  }

  const boxes: Box[] = [{...computeBounds(pixels), pixels}]

  // Цикл разбиения — репортим прогресс от 10 до 70
  while (boxes.length < count * 2) {
    boxes.sort((a, b) => {
      const va = (a.max.r - a.min.r) * (a.max.g - a.min.g) * (a.max.b - a.min.b)
      const vb = (b.max.r - b.min.r) * (b.max.g - b.min.g) * (b.max.b - b.min.b)
      return vb - va
    })

    const biggest = boxes.shift()
    if (!biggest || biggest.pixels.length < 2) {
      if (biggest) boxes.unshift(biggest)
      break
    }

    const [a, b] = splitBox(biggest)
    boxes.push(a, b)

    const p = Math.round(10 + (boxes.length / (count * 2)) * 60)
    onProgress?.(Math.min(70, p))
  }

  // Усреднение
  const totalPixels = pixels.length
  const palette: PaletteColor[] = boxes.map(box => {
    const avg = averageColor(box.pixels)
    return {
      ...avg,
      hex: toHex(avg),
      percentage: (box.pixels.length / totalPixels) * 100,
    }
  })

  onProgress?.(80)

  palette.sort((a, b) => b.percentage - a.percentage)

  const merged: PaletteColor[] = []
  for (const color of palette) {
    const dup = merged.find(m => colorDistance(m, color) < mergeThreshold)
    if (dup) {
      dup.percentage += color.percentage
    } else {
      merged.push({...color})
    }
  }

  onProgress?.(95)

  const top = merged.slice(0, count)
  const sum = top.reduce((s, c) => s + c.percentage, 0) || 1
  const result = top.map(c => ({
    ...c,
    percentage: (c.percentage / sum) * 100,
  }))

  onProgress?.(100)
  return result
}
