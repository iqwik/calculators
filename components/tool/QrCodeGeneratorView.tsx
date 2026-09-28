'use client'

import {Copy, Download, RotateCcw} from 'lucide-react'
import {useTranslations} from 'next-intl'
import QRCode from 'qrcode'
import {useEffect, useMemo, useRef, useState} from 'react'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {Slider} from '../ui/slider'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip'

type Mode = 'qr' | 'barcode'
type QrType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
type Level = 'L' | 'M' | 'Q' | 'H'
type Encryption = 'WPA' | 'WEP' | 'nopass'

const QR_TYPES: QrType[] = [
  'url',
  'text',
  'email',
  'phone',
  'sms',
  'wifi',
  'vcard',
]

const QR_TYPE_ICONS: Record<QrType, string> = {
  url: '🔗',
  text: 'Aa',
  email: '✉️',
  phone: '☎️',
  sms: '💬',
  wifi: '📶',
  vcard: '👤',
}

const LEVELS: Level[] = ['L', 'M', 'Q', 'H']

interface Fields {
  url: string
  text: string
  emailTo: string
  emailSubject: string
  emailBody: string
  phone: string
  smsNumber: string
  smsMessage: string
  wifiSsid: string
  wifiPassword: string
  wifiEncryption: Encryption
  wifiHidden: boolean
  vcardFirstName: string
  vcardLastName: string
  vcardOrg: string
  vcardTitle: string
  vcardPhone: string
  vcardEmail: string
  vcardUrl: string
}

const INITIAL_FIELDS: Fields = {
  url: '',
  text: '',
  emailTo: '',
  emailSubject: '',
  emailBody: '',
  phone: '',
  smsNumber: '',
  smsMessage: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiEncryption: 'WPA',
  wifiHidden: false,
  vcardFirstName: '',
  vcardLastName: '',
  vcardOrg: '',
  vcardTitle: '',
  vcardPhone: '',
  vcardEmail: '',
  vcardUrl: '',
}

function buildPayload(type: QrType, f: Fields): string {
  switch (type) {
    case 'url':
      return f.url
    case 'text':
      return f.text
    case 'email': {
      if (!f.emailTo) return ''
      const params: string[] = []
      if (f.emailSubject)
        params.push(`subject=${encodeURIComponent(f.emailSubject)}`)
      if (f.emailBody) params.push(`body=${encodeURIComponent(f.emailBody)}`)
      return `mailto:${f.emailTo}${params.length ? '?' + params.join('&') : ''}`
    }
    case 'phone':
      return f.phone ? `tel:${f.phone.replace(/\s/g, '')}` : ''
    case 'sms':
      return f.smsNumber
        ? `SMSTO:${f.smsNumber.replace(/\s/g, '')}:${f.smsMessage}`
        : ''
    case 'wifi': {
      if (!f.wifiSsid) return ''
      const enc = f.wifiEncryption
      const pass = enc === 'nopass' ? '' : f.wifiPassword
      const hidden = f.wifiHidden ? 'H:true;' : ''
      return `WIFI:T:${enc};S:${f.wifiSsid};P:${pass};${hidden};`
    }
    case 'vcard': {
      const {vcardFirstName, vcardLastName, vcardOrg, vcardTitle} = f
      if (!vcardFirstName && !vcardLastName) return ''
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${vcardLastName};${vcardFirstName};;;`,
        `FN:${[vcardFirstName, vcardLastName].filter(Boolean).join(' ')}`,
      ]
      if (vcardOrg) lines.push(`ORG:${vcardOrg}`)
      if (vcardTitle) lines.push(`TITLE:${vcardTitle}`)
      if (f.vcardPhone) lines.push(`TEL:${f.vcardPhone}`)
      if (f.vcardEmail) lines.push(`EMAIL:${f.vcardEmail}`)
      if (f.vcardUrl) lines.push(`URL:${f.vcardUrl}`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function scanContrast(fg: string, bg: string): number {
  return Math.abs(luminance(fg) - luminance(bg)) / 2.55
}

type ContrastLevel = 'excellent' | 'good' | 'poor'

function contrastLevel(pct: number): ContrastLevel {
  if (pct >= 60) return 'excellent'
  if (pct >= 40) return 'good'
  return 'poor'
}

function validateUrl(url: string): boolean {
  if (!url) return true
  return /^(https?:\/\/|www\.)/i.test(url) || /\./.test(url)
}

export function QrCodeGeneratorView() {
  const t = useTranslations('config')

  const [mode, setMode] = useState<Mode>('qr')
  const [qrType, setQrType] = useState<QrType>('url')
  const [fields, setFields] = useState<Fields>(INITIAL_FIELDS)
  const [size, setSize] = useState(320)
  const [margin, setMargin] = useState(2)
  const [level, setLevel] = useState<Level>('M')
  const [fg, setFg] = useState('#1a1917')
  const [bg, setBg] = useState('#ffffff')

  const [svg, setSvg] = useState('')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copySupported, setCopySupported] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const payload = useMemo(
    () => buildPayload(qrType, fields),
    [qrType, fields],
  )

  const contrast = useMemo(() => scanContrast(fg, bg), [fg, bg])
  const contrastLvl = contrastLevel(contrast)

  const urlWarning =
    qrType === 'url' && payload.length > 0 && !validateUrl(payload)

  useEffect(() => {
    if (typeof ClipboardItem === 'undefined') {
      setCopySupported(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function render() {
      setRenderError(null)

      if (!payload) {
        setSvg('')
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        return
      }

      try {
        const opts = {
          width: size,
          margin,
          errorCorrectionLevel: level,
          color: {dark: fg, light: bg},
        }

        const canvas = canvasRef.current
        if (canvas) {
          await QRCode.toCanvas(canvas, payload, opts)
        }

        const svgString = await QRCode.toString(payload, {
          type: 'svg',
          margin,
          errorCorrectionLevel: level,
          color: {dark: fg, light: bg},
        })
        if (!cancelled) setSvg(svgString)
      } catch (e) {
        if (!cancelled) {
          setRenderError(e instanceof Error ? e.message : String(e))
          setSvg('')
        }
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [payload, size, margin, level, fg, bg])

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields(prev => ({...prev, [key]: value}))
  }

  function downloadPng() {
    const canvas = canvasRef.current
    if (!canvas || !payload) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr-code.png'
    a.click()
  }

  function downloadSvg() {
    if (!svg) return
    const blob = new Blob([svg], {type: 'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr-code.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyPng() {
    const canvas = canvasRef.current
    if (!canvas || !payload || !copySupported) return
    try {
      const blob: Blob | null = await new Promise(resolve =>
        canvas.toBlob(b => resolve(b), 'image/png'),
      )
      if (!blob) return
      await navigator.clipboard.write([
        new ClipboardItem({[blob.type]: blob}),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard может быть недоступен
    }
  }

  function handleReset() {
    setFields(INITIAL_FIELDS)
    setSize(320)
    setMargin(2)
    setLevel('M')
    setFg('#1a1917')
    setBg('#ffffff')
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl border bg-card p-1">
          <button
            type="button"
            onClick={() => setMode('qr')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              mode === 'qr'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span aria-hidden>▦</span> {t('qr-code-generator.modeQr')}
          </button>
          <button
            type="button"
            disabled
            title={t('qr-code-generator.barcodeComingSoon')}
            className="flex cursor-not-allowed items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium text-muted-foreground/50"
          >
            <span aria-hidden>▥</span> {t('qr-code-generator.modeBarcode')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        {/* Controls */}
        <div className="space-y-5">

          {/* Section 1: Type */}
          <Section number={1} title={t('qr-code-generator.sections.type')} hint={t('qr-code-generator.sections.typeHint')}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {QR_TYPES.map(type => (
                <Tooltip key={type}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => setQrType(type)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition ${
                          qrType === type
                            ? 'border-primary/40 bg-primary/10'
                            : 'border-border bg-background hover:border-primary/30 hover:bg-muted/40'
                        }`}
                      />
                    }
                  >
                    <span className="text-xl leading-none" aria-hidden>
                      {QR_TYPE_ICONS[type]}
                    </span>
                    <span className="w-full truncate text-xs font-medium">
                      {t(`qr-code-generator.types.${type}`)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t(`qr-code-generator.typeHints.${type}`)}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div> 
          </Section>

          {/* Section 2: Fields */}
          <Section number={2} title={t('qr-code-generator.sections.details')} hint={t(`qr-code-generator.detailsHint.${qrType}`)}>
            <FieldsForType
              qrType={qrType}
              fields={fields}
              update={update}
              urlWarning={urlWarning}
            />
          </Section>

          {/* Section 3: Design */}
          <Section number={3} title={t('qr-code-generator.sections.design')} hint={t('qr-code-generator.sections.designHint')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {t('qr-code-generator.size')}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {size}px
                  </span>
                </div>
                <Slider
                  value={[size]}
                  min={160}
                  max={640}
                  step={20}
                  onValueChange={v =>
                    setSize(Array.isArray(v) ? v[0] : v)
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {t('qr-code-generator.margin')}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {margin} {t('qr-code-generator.modules')}
                  </span>
                </div>
                <Slider
                  value={[margin]}
                  min={0}
                  max={8}
                  step={1}
                  onValueChange={v =>
                    setMargin(Array.isArray(v) ? v[0] : v)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('qr-code-generator.errorLevel')}
                </label>
                <Select
                  items={LEVELS.map(l => ({
                    value: l,
                    label: t(`qr-code-generator.levels.${l}`),
                  }))}
                  value={level}
                  onValueChange={v => setLevel(v as Level)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => (
                      <SelectItem key={l} value={l}>
                        {t(`qr-code-generator.levels.${l}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium leading-none">
                      {t('qr-code-generator.darkColor')}
                    </label>
                    <input
                      type="color"
                      value={fg}
                      onChange={e => setFg(e.target.value)}
                      className="h-9 w-full cursor-pointer rounded-md border bg-background p-1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium leading-none">
                      {t('qr-code-generator.lightColor')}
                    </label>
                    <input
                      type="color"
                      value={bg}
                      onChange={e => setBg(e.target.value)}
                      className="h-9 w-full cursor-pointer rounded-md border bg-background p-1"
                    />
                  </div>
                </div>
                <p
                  className={`pt-1 text-xs ${
                    contrastLvl === 'excellent'
                      ? 'text-green-600 dark:text-green-400'
                      : contrastLvl === 'good'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {t('qr-code-generator.scanContrast')}:{' '}
                  {t(`qr-code-generator.contrast.${contrastLvl}`)}
                </p>
              </div>
            </div>
          </Section>

          {/* Encoded payload */}
          {payload && (
            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="mb-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {t('qr-code-generator.encodedPayload')}
              </div>
              <p className="break-all font-mono text-xs leading-relaxed text-foreground">
                {payload}
              </p>
            </div>
          )}
        </div>

        {/* Preview panel */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold uppercase">
                {t(`qr-code-generator.types.${qrType}`)}
              </span>
              <span className="text-xs text-muted-foreground">{size}px</span>
            </div>

            <div className="flex items-center justify-center rounded-xl border bg-muted/20 p-4">
              {payload && !renderError ? (
                <canvas
                  ref={canvasRef}
                  className="block max-w-full"
                  style={{width: size, height: size}}
                />
              ) : (
                <div className="flex h-60 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  {renderError
                    ? renderError
                    : t('qr-code-generator.emptyHint')}
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {t('qr-code-generator.previewStatus')}
              </div>
              <div className="mt-1 text-sm font-semibold">
                {payload && !renderError
                  ? t('qr-code-generator.ready')
                  : t('qr-code-generator.waiting')}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {payload
                  ? t('qr-code-generator.readyHint')
                  : t('qr-code-generator.waitingHint')}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={downloadPng}
                disabled={!payload || !!renderError}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                PNG
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={downloadSvg}
                disabled={!svg || !!renderError}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                SVG
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={copyPng}
                disabled={!payload || !!renderError || !copySupported}
                title={
                  !copySupported
                    ? t('qr-code-generator.copyNotSupported')
                    : undefined
                }
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {copied
                  ? t('qr-code-generator.copied')
                  : t('qr-code-generator.copyPng')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                {t('qr-code-generator.reset')}
              </Button>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {t('qr-code-generator.quickTip')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

interface SectionProps {
  number: number
  title: string
  hint: string
  children: React.ReactNode
}

function Section({number, title, hint, children}: SectionProps) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {number}
        </span>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

interface FieldsProps {
  qrType: QrType
  fields: Fields
  update: <K extends keyof Fields>(key: K, value: Fields[K]) => void
  urlWarning: boolean
}

function FieldsForType({qrType, fields, update, urlWarning}: FieldsProps) {
  const t = useTranslations('config')

  if (qrType === 'url') {
    return (
      <div className="space-y-2">
        <Input
          value={fields.url}
          onChange={e => update('url', e.target.value)}
          placeholder="https://example.com"
          className="font-mono"
        />
        {urlWarning && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            {t('qr-code-generator.urlWarning')}
          </p>
        )}
      </div>
    )
  }

  if (qrType === 'text') {
    return (
      <textarea
        value={fields.text}
        onChange={e => update('text', e.target.value)}
        placeholder={t('qr-code-generator.textPlaceholder')}
        rows={4}
        className="w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    )
  }

  if (qrType === 'email') {
    return (
      <div className="space-y-3">
        <Input
          value={fields.emailTo}
          onChange={e => update('emailTo', e.target.value)}
          placeholder={t('qr-code-generator.emailTo')}
          type="email"
        />
        <Input
          value={fields.emailSubject}
          onChange={e => update('emailSubject', e.target.value)}
          placeholder={t('qr-code-generator.emailSubject')}
        />
        <textarea
          value={fields.emailBody}
          onChange={e => update('emailBody', e.target.value)}
          placeholder={t('qr-code-generator.emailBody')}
          rows={3}
          className="w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    )
  }

  if (qrType === 'phone') {
    return (
      <Input
        value={fields.phone}
        onChange={e => update('phone', e.target.value)}
        placeholder="+1 555 123 4567"
        className="font-mono"
      />
    )
  }

  if (qrType === 'sms') {
    return (
      <div className="space-y-3">
        <Input
          value={fields.smsNumber}
          onChange={e => update('smsNumber', e.target.value)}
          placeholder="+1 555 123 4567"
          className="font-mono"
        />
        <textarea
          value={fields.smsMessage}
          onChange={e => update('smsMessage', e.target.value)}
          placeholder={t('qr-code-generator.smsMessage')}
          rows={3}
          className="w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    )
  }

  if (qrType === 'wifi') {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {t('qr-code-generator.wifiSsid')}
          </label>
          <Input
            value={fields.wifiSsid}
            onChange={e => update('wifiSsid', e.target.value)}
            placeholder="My Wi-Fi"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t('qr-code-generator.wifiPassword')}
            </label>
            <Input
              value={fields.wifiPassword}
              onChange={e => update('wifiPassword', e.target.value)}
              placeholder="••••••••"
              disabled={fields.wifiEncryption === 'nopass'}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {t('qr-code-generator.wifiEncryption')}
            </label>
            <Select
              items={[
                {value: 'WPA', label: 'WPA/WPA2'},
                {value: 'WEP', label: 'WEP'},
                {value: 'nopass', label: t('qr-code-generator.noPassword')},
              ]}
              value={fields.wifiEncryption}
              onValueChange={v => update('wifiEncryption', v as Encryption)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">
                  {t('qr-code-generator.noPassword')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={fields.wifiHidden}
            onChange={e => update('wifiHidden', e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          {t('qr-code-generator.wifiHidden')}
        </label>
      </div>
    )
  }

  // vcard
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={fields.vcardFirstName}
          onChange={e => update('vcardFirstName', e.target.value)}
          placeholder={t('qr-code-generator.vcardFirstName')}
        />
        <Input
          value={fields.vcardLastName}
          onChange={e => update('vcardLastName', e.target.value)}
          placeholder={t('qr-code-generator.vcardLastName')}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={fields.vcardOrg}
          onChange={e => update('vcardOrg', e.target.value)}
          placeholder={t('qr-code-generator.vcardOrg')}
        />
        <Input
          value={fields.vcardTitle}
          onChange={e => update('vcardTitle', e.target.value)}
          placeholder={t('qr-code-generator.vcardTitle')}
        />
      </div>
      <Input
        value={fields.vcardPhone}
        onChange={e => update('vcardPhone', e.target.value)}
        placeholder={t('qr-code-generator.vcardPhone')}
        className="font-mono"
      />
      <Input
        value={fields.vcardEmail}
        onChange={e => update('vcardEmail', e.target.value)}
        placeholder={t('qr-code-generator.vcardEmail')}
        type="email"
      />
      <Input
        value={fields.vcardUrl}
        onChange={e => update('vcardUrl', e.target.value)}
        placeholder={t('qr-code-generator.vcardUrl')}
      />
    </div>
  )
}
