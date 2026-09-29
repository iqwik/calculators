export type DetectedType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'image/bmp'
  | 'image/svg+xml'
  | 'image/avif'
  | 'image/ico'
  | 'image/unknown'

export interface ParsedBase64 {
  bytes: Uint8Array
  mime: DetectedType
  /** Raw base64 without prefix and whitespace - inject into code */
  clean: string
}

const DATA_URI_RE = /^data:([^;,]+)?(;[^,]*)?,(.*)$/s

function detectMimeFromBytes(bytes: Uint8Array): DetectedType {
  if (bytes.length < 4) return 'image/unknown'

  // PNG: 89 50 4E 47
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png'
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  // GIF: 47 49 46
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif'
  }
  // BMP: 42 4D
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return 'image/bmp'
  }
  // ICO: 00 00 01 00
  if (
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    bytes[2] === 0x01 &&
    bytes[3] === 0x00
  ) {
    return 'image/ico'
  }
  // WebP: RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }

  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70 &&
    bytes[8] === 0x61 &&
    bytes[9] === 0x76 &&
    bytes[10] === 0x69 &&
    bytes[11] === 0x66
  ) {
    return 'image/avif'
  }

  const head = new TextDecoder('utf-8', {fatal: false})
    .decode(bytes.slice(0, 64))
    .trimStart()
  if (head.startsWith('<?xml') || head.startsWith('<svg')) {
    return 'image/svg+xml'
  }
  return 'image/unknown'
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export function parseBase64Image(raw: string): ParsedBase64 | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let payload = trimmed
  let declaredMime = ''

  const m = trimmed.match(DATA_URI_RE)
  if (m) {
    declaredMime = m[1] ?? ''
    payload = m[3]
  }

  const clean = payload.replace(/\s+/g, '')
  if (clean.length === 0) return null

  if (!/^[A-Za-z0-9+/=_-]+$/.test(clean)) return null

  let bytes: Uint8Array
  try {
    bytes = base64ToBytes(clean.replace(/-/g, '+').replace(/_/g, '/'))
  } catch {
    return null
  }

  let mime = detectMimeFromBytes(bytes)

  if (mime === 'image/unknown' && declaredMime.startsWith('image/')) {
    mime = declaredMime as DetectedType
  }

  return {bytes, mime, clean}
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin)
}

export function bytesToDataUri(bytes: Uint8Array, mime: string): string {
  return `data:${mime};base64,${bytesToBase64(bytes)}`
}

export function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(blob)
  })
}
