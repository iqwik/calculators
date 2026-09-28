'use client'

import {
  ExternalLink,
  FileDown,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useMemo, useRef, useState} from 'react'
import {Button} from '../ui/button'
import {DatePicker} from '../ui/date-picker'
import {Input} from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

type Template = 'modern' | 'classic'
type ThemeColor = 'emerald' | 'blue' | 'violet' | 'rose' | 'gray'
type FontSize = 'small' | 'medium' | 'large'

interface LineItem {
  id: string
  description: string
  quantity: number
  price: number
}

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  fromName: string
  fromEmail: string
  fromAddress: string
  toName: string
  toEmail: string
  toAddress: string
  items: LineItem[]
  taxRate: number
  discountAmount: number
  notes: string
  template: Template
  themeColor: ThemeColor
  fontSize: FontSize
  logoUrl: string | null
}

interface Totals {
  subtotal: number
  taxable: number
  tax: number
  total: number
}

const STORAGE_KEY = 'invoice-generator-draft-v2'

const CURRENCIES = ['USD', 'EUR', 'RUB', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
}

const THEME_COLORS: Record<
  ThemeColor,
  {hex: string; bg: string; ring: string}
> = {
  emerald: {hex: '#10b981', bg: '#ecfdf5', ring: '#a7f3d0'},
  blue: {hex: '#3b82f6', bg: '#eff6ff', ring: '#bfdbfe'},
  violet: {hex: '#8b5cf6', bg: '#f5f3ff', ring: '#ddd6fe'},
  rose: {hex: '#f43f5e', bg: '#fff1f2', ring: '#fecdd3'},
  gray: {hex: '#6b7280', bg: '#f9fafb', ring: '#e5e7eb'},
}

const FONT_SIZES: Record<FontSize, number> = {
  small: 12,
  medium: 13,
  large: 15,
}

function initialStaticInvoice(): InvoiceData {
  return {
    invoiceNumber: 'INV-000000-001',
    issueDate: '2025-01-01',
    dueDate: '2025-01-31',
    currency: 'USD',
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    toName: '',
    toEmail: '',
    toAddress: '',
    items: [{id: 'default-item', description: '', quantity: 1, price: 0}],
    taxRate: 0,
    discountAmount: 0,
    notes: '',
    template: 'modern',
    themeColor: 'emerald',
    fontSize: 'medium',
    logoUrl: null,
  }
}

function freshInvoice(): InvoiceData {
  const today = new Date()
  const due = new Date()
  due.setDate(due.getDate() + 30)
  const iso = (d: Date) => d.toISOString().slice(0, 10)

  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 900) + 100)

  return {
    ...initialStaticInvoice(),
    invoiceNumber: `INV-${y}${m}-${rand}`,
    issueDate: iso(today),
    dueDate: iso(due),
    items: [{id: crypto.randomUUID(), description: '', quantity: 1, price: 0}],
  }
}

function newItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    price: 0,
  }
}

export function InvoiceGeneratorView() {
  const t = useTranslations('config')

  const [data, setData] = useState<InvoiceData>(initialStaticInvoice)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<InvoiceData>
        setData(prev => ({...prev, ...parsed}))
        setHydrated(true)
        return
      } catch {
        // ignore corrupted storage
      }
    }
    setData(freshInvoice())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data, hydrated])

  const totals = useMemo<Totals>(() => {
    const subtotal = data.items.reduce((s, i) => s + i.quantity * i.price, 0)
    const taxable = subtotal - data.discountAmount
    const tax = (taxable * data.taxRate) / 100
    const total = taxable + tax
    return {subtotal, taxable, tax, total}
  }, [data.items, data.discountAmount, data.taxRate])

  function update<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) {
    setData(prev => ({...prev, [key]: value}))
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => (i.id === id ? {...i, ...patch} : i)),
    }))
  }

  function addItem() {
    setData(prev => ({...prev, items: [...prev.items, newItem()]}))
  }

  function removeItem(id: string) {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
    }))
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('logoUrl', String(reader.result))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleReset() {
    if (!confirm(t('invoice-generator.confirmReset'))) return
    setData(freshInvoice())
  }

  function handlePrint() {
    window.print()
  }

  const currencySymbol = CURRENCY_SYMBOLS[data.currency] ?? data.currency

  function handleOpenPreviewWindow() {
    const previewEl = document.getElementById('invoice-preview')
    if (!previewEl) return

    const html = previewEl.outerHTML
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]'),
    )
      .map(el => el.outerHTML)
      .join('')

    const win = window.open('', '_blank', 'width=900,height=1000')
    if (!win) return

    win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${data.invoiceNumber || 'Invoice'}</title>
        ${styles}
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
          }
          #invoice-preview {
            width: 100%;
            min-height: 100vh;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          @media print {
            body { background: white; }
            #invoice-preview {
              width: 100%;
              min-height: auto;
            }
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `)
    win.document.close()
  }

  return (
    <div className="space-y-4">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 p-2 backdrop-blur print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenPreviewWindow}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            {t('invoice-generator.preview')}
          </Button>
          <Button type="button" size="sm" onClick={handlePrint}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            {t('invoice-generator.downloadPdf')}
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-destructive hover:text-destructive"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          {t('invoice-generator.reset')}
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] print:block">
        {/* FORM */}
        <div className="space-y-3 print:hidden">
          {/* Customization */}
          <Section title={t('invoice-generator.customization')}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FieldSelect
                label={t('invoice-generator.template')}
                value={data.template}
                onChange={v => update('template', v as Template)}
                options={[
                  {
                    value: 'modern',
                    label: t('invoice-generator.templateModern'),
                  },
                  {
                    value: 'classic',
                    label: t('invoice-generator.templateClassic'),
                  },
                ]}
              />
              <FieldSelect
                label={t('invoice-generator.themeColor')}
                value={data.themeColor}
                onChange={v => update('themeColor', v as ThemeColor)}
                options={[
                  {
                    value: 'emerald',
                    label: t('invoice-generator.colorEmerald'),
                  },
                  {value: 'blue', label: t('invoice-generator.colorBlue')},
                  {
                    value: 'violet',
                    label: t('invoice-generator.colorViolet'),
                  },
                  {value: 'rose', label: t('invoice-generator.colorRose')},
                  {value: 'gray', label: t('invoice-generator.colorGray')},
                ]}
              />
              <FieldSelect
                label={t('invoice-generator.fontSize')}
                value={data.fontSize}
                onChange={v => update('fontSize', v as FontSize)}
                options={[
                  {value: 'small', label: t('invoice-generator.fontSmall')},
                  {value: 'medium', label: t('invoice-generator.fontMedium')},
                  {value: 'large', label: t('invoice-generator.fontLarge')},
                ]}
              />
            </div>
          </Section>

          {/* Logo */}
          <Section title={t('invoice-generator.companyLogo')}>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {t('invoice-generator.uploadLogo')}
              </Button>
              {data.logoUrl && (
                <>
                  {/* biome-ignore lint/performance/noImgElement: user-uploaded preview */}
                  <img
                    src={data.logoUrl}
                    alt=""
                    className="h-10 max-w-30 rounded border bg-white object-contain p-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => update('logoUrl', null)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label={t('invoice-generator.removeLogo')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </Section>

          {/* From / To */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Section title={t('invoice-generator.from')}>
              <div className="space-y-2">
                <Input
                  value={data.fromName}
                  onChange={e => update('fromName', e.target.value)}
                  placeholder={t('invoice-generator.companyName')}
                  className="h-9"
                />
                <Input
                  type="email"
                  value={data.fromEmail}
                  onChange={e => update('fromEmail', e.target.value)}
                  placeholder={t('invoice-generator.email')}
                  className="h-9"
                />
                <textarea
                  value={data.fromAddress}
                  onChange={e => update('fromAddress', e.target.value)}
                  placeholder={t('invoice-generator.address')}
                  rows={2}
                  className="w-full resize-none rounded-lg border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </Section>

            <Section title={t('invoice-generator.billTo')}>
              <div className="space-y-2">
                <Input
                  value={data.toName}
                  onChange={e => update('toName', e.target.value)}
                  placeholder={t('invoice-generator.clientName')}
                  className="h-9"
                />
                <Input
                  type="email"
                  value={data.toEmail}
                  onChange={e => update('toEmail', e.target.value)}
                  placeholder={t('invoice-generator.clientEmail')}
                  className="h-9"
                />
                <textarea
                  value={data.toAddress}
                  onChange={e => update('toAddress', e.target.value)}
                  placeholder={t('invoice-generator.clientAddress')}
                  rows={2}
                  className="w-full resize-none rounded-lg border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </Section>
          </div>

          {/* Meta */}
          <Section title={t('invoice-generator.invoiceDetails')}>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="inv-number">
                  {t('invoice-generator.invoiceNumber')}
                </FieldLabel>
                <Input
                  id="inv-number"
                  value={data.invoiceNumber}
                  onChange={e => update('invoiceNumber', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="inv-issue">
                  {t('invoice-generator.issueDate')}
                </FieldLabel>
                <DatePicker
                  id="inv-issue"
                  value={data.issueDate}
                  onChange={v => update('issueDate', v)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="inv-due">
                  {t('invoice-generator.dueDate')}
                </FieldLabel>
                <DatePicker
                  id="inv-due"
                  value={data.dueDate}
                  onChange={v => update('dueDate', v)}
                  className="h-9"
                />
              </div>
              <FieldSelect
                label={t('invoice-generator.currency')}
                value={data.currency}
                onChange={v => update('currency', v)}
                options={CURRENCIES.map(c => ({
                  value: c,
                  label: `${c} (${CURRENCY_SYMBOLS[c] ?? c})`,
                }))}
              />
            </div>
          </Section>

          {/* Line Items */}
          <Section
            title={t('invoice-generator.lineItems')}
            subtitle={t('invoice-generator.lineItemsHint')}
          >
            <div className="mb-2 hidden grid-cols-[minmax(0,1fr)_72px_110px_96px_36px] gap-2 px-1 md:grid">
              <ColLabel>{t('invoice-generator.itemDescription')}</ColLabel>
              <ColLabel align="center">{t('invoice-generator.qty')}</ColLabel>
              <ColLabel align="right">{t('invoice-generator.price')}</ColLabel>
              <ColLabel align="right">{t('invoice-generator.amount')}</ColLabel>
              <span />
            </div>

            <div className="space-y-2">
              {data.items.map(item => {
                const lineTotal = item.quantity * item.price
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 gap-2 rounded-lg border bg-background p-2 md:grid-cols-[minmax(0,1fr)_72px_110px_96px_36px] md:border-0 md:bg-transparent md:p-0"
                  >
                    <Input
                      value={item.description}
                      onChange={e =>
                        updateItem(item.id, {description: e.target.value})
                      }
                      placeholder={t('invoice-generator.itemDescription')}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e =>
                        updateItem(item.id, {
                          quantity: Number(e.target.value) || 0,
                        })
                      }
                      className="h-9 text-center tabular-nums"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.price}
                      onChange={e =>
                        updateItem(item.id, {
                          price: Number(e.target.value) || 0,
                        })
                      }
                      className="h-9 text-right tabular-nums"
                    />
                    <div className="flex items-center justify-end text-sm font-medium tabular-nums">
                      {currencySymbol}
                      {lineTotal.toFixed(2)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={data.items.length === 1}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      aria-label={t('invoice-generator.removeItem')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-3"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t('invoice-generator.addNewItem')}
            </Button>
          </Section>

          {/* Notes */}
          <Section title={t('invoice-generator.notesTerms')}>
            <textarea
              value={data.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder={t('invoice-generator.notesPlaceholder')}
              rows={3}
              className="w-full resize-none rounded-lg border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Section>

          {/* Totals */}
          <Section title={t('invoice-generator.summary')}>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  {t('invoice-generator.subtotal')}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {currencySymbol}
                  {totals.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="inv-discount"
                  className="text-sm text-muted-foreground"
                >
                  {t('invoice-generator.discountAmount')}
                </label>
                <Input
                  id="inv-discount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={data.discountAmount}
                  onChange={e =>
                    update('discountAmount', Number(e.target.value) || 0)
                  }
                  className="h-9 w-32 text-right tabular-nums"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="inv-tax"
                  className="text-sm text-muted-foreground"
                >
                  {t('invoice-generator.taxRate')}
                </label>
                <Input
                  id="inv-tax"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={data.taxRate}
                  onChange={e => update('taxRate', Number(e.target.value) || 0)}
                  className="h-9 w-32 text-right tabular-nums"
                />
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-base font-bold">
                  {t('invoice-generator.total')}
                </span>
                <span
                  className="text-2xl font-black tabular-nums"
                  style={{color: THEME_COLORS[data.themeColor].hex}}
                >
                  {currencySymbol}
                  {totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* PREVIEW — desktop sticky */}
        <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start print:static print:block">
          <InvoicePreview data={data} totals={totals} />
        </div>
      </div>

      {/* Fullscreen preview for mobile */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <button
            type="button"
            aria-label={t('invoice-generator.closePreview')}
            onClick={() => setPreviewOpen(false)}
            className="absolute inset-0 cursor-default border-0 bg-black/70"
          />
          <div className="relative max-h-full w-full max-w-225 overflow-auto rounded-2xl bg-white">
            <InvoicePreview data={data} totals={totals} fullWidth />
          </div>
        </div>
      )}
    </div>
  )
}

/* === Sub-components === */

interface SectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

function Section({title, subtitle, children}: SectionProps) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  )
}

interface FieldLabelProps {
  htmlFor: string
  children: React.ReactNode
}

function FieldLabel({htmlFor, children}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold whitespace-nowrap text-muted-foreground"
    >
      {children}
    </label>
  )
}

interface ColLabelProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}

function ColLabel({children, align = 'left'}: ColLabelProps) {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
        ? 'text-right'
        : 'text-left'
  return (
    <span
      className={`text-[11px] font-semibold tracking-wide text-muted-foreground uppercase ${alignClass}`}
    >
      {children}
    </span>
  )
}

interface FieldSelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: {value: string; label: string}[]
}

function FieldSelect({label, value, onChange, options}: FieldSelectProps) {
  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-semibold whitespace-nowrap text-muted-foreground">
        {label}
      </span>
      <Select
        items={options}
        value={value}
        onValueChange={v => onChange(v ?? '')}
      >
        <SelectTrigger className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface InvoicePreviewProps {
  data: InvoiceData
  totals: Totals
  fullWidth?: boolean
}

function InvoicePreview({
  data,
  totals,
  fullWidth = false,
}: InvoicePreviewProps) {
  const t = useTranslations('config')
  const theme = THEME_COLORS[data.themeColor]
  const symbol = CURRENCY_SYMBOLS[data.currency] ?? data.currency
  const isModern = data.template === 'modern'
  const fontSize = FONT_SIZES[data.fontSize]

  const fmt = (n: number) =>
    `${symbol}${n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return (
    <div
      id="invoice-preview"
      className={`relative overflow-hidden bg-white text-gray-900 ${
        fullWidth ? '' : 'rounded-2xl border shadow-sm'
      }`}
      style={{fontSize, minHeight: '700px'}}
    >
      {isModern && (
        <div
          className="absolute top-0 left-0 h-2 w-full print:block"
          style={{background: theme.hex}}
        />
      )}

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mt-2 mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            {data.logoUrl ? (
              // biome-ignore lint/performance/noImgElement: user logo
              <img
                src={data.logoUrl}
                alt=""
                className="mb-3 h-11 max-w-37.5 object-contain"
              />
            ) : (
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                {t('invoice-generator.previewLogo')}
              </div>
            )}
            <div className="text-lg font-extrabold tracking-tight text-gray-900">
              {data.fromName || t('invoice-generator.previewYourCompany')}
            </div>
            {data.fromEmail && (
              <p className="mt-0.5 text-xs text-gray-500">{data.fromEmail}</p>
            )}
            {data.fromAddress && (
              <p className="mt-0.5 text-xs leading-relaxed whitespace-pre-wrap text-gray-500">
                {data.fromAddress}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <h2
              className="mb-3 text-3xl font-black tracking-tight uppercase"
              style={{color: isModern ? theme.hex : '#111827'}}
            >
              {t('invoice-generator.previewInvoiceTitle')}
            </h2>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-right text-xs">
              <span className="font-semibold tracking-wide whitespace-nowrap text-gray-400 uppercase">
                {t('invoice-generator.previewInvoiceHash')}
              </span>
              <span className="font-bold text-gray-900">
                {data.invoiceNumber}
              </span>

              <span className="font-semibold tracking-wide whitespace-nowrap text-gray-400 uppercase">
                {t('invoice-generator.previewDate')}
              </span>
              <span className="font-bold text-gray-900">{data.issueDate}</span>

              <span className="font-semibold tracking-wide whitespace-nowrap text-gray-400 uppercase">
                {t('invoice-generator.previewDue')}
              </span>
              <span className="font-bold text-gray-900">{data.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div
          className="mb-8 rounded-xl border p-4"
          style={
            isModern
              ? {background: theme.bg, borderColor: theme.ring}
              : {background: '#f9fafb', borderColor: '#f3f4f6'}
          }
        >
          <h3
            className="mb-2 text-[10px] font-bold tracking-widest uppercase"
            style={{color: isModern ? theme.hex : '#6b7280'}}
          >
            {t('invoice-generator.previewBilledTo')}
          </h3>
          <p className="text-base font-bold text-gray-900">
            {data.toName || t('invoice-generator.previewClientNameFallback')}
          </p>
          {data.toEmail && (
            <p className="mt-0.5 text-xs text-gray-600">{data.toEmail}</p>
          )}
          {data.toAddress && (
            <p className="mt-0.5 text-xs leading-relaxed whitespace-pre-wrap text-gray-600">
              {data.toAddress}
            </p>
          )}
        </div>

        {/* Items table */}
        <div className="mb-6">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-900">
                <th className="py-2 pr-3 text-[10px] font-bold tracking-wider text-gray-900 uppercase">
                  {t('invoice-generator.previewDescription')}
                </th>
                <th
                  className="py-2 text-center text-[10px] font-bold tracking-wider text-gray-900 uppercase"
                  style={{width: '40px'}}
                >
                  {t('invoice-generator.previewQty')}
                </th>
                <th
                  className="py-2 text-right text-[10px] font-bold tracking-wider text-gray-900 uppercase"
                  style={{width: '90px'}}
                >
                  {t('invoice-generator.previewRate')}
                </th>
                <th
                  className="py-2 text-right text-[10px] font-bold tracking-wider text-gray-900 uppercase"
                  style={{width: '90px'}}
                >
                  {t('invoice-generator.previewAmount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map(item => (
                <tr key={item.id}>
                  <td className="py-3 pr-3 text-xs font-medium text-gray-800">
                    <div className="truncate">
                      {item.description || (
                        <span className="font-normal text-gray-300 italic">
                          {t(
                            'invoice-generator.previewItemDescriptionPlaceholder',
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className="py-3 text-center text-xs font-medium text-gray-800 tabular-nums"
                    style={{width: '40px'}}
                  >
                    <div className="truncate">{item.quantity}</div>
                  </td>
                  <td
                    className="py-3 text-right text-xs font-medium text-gray-800 tabular-nums"
                    style={{width: '90px'}}
                  >
                    <div className="truncate">{fmt(item.price)}</div>
                  </td>
                  <td className="truncate py-3 text-right text-xs font-bold text-gray-900 tabular-nums">
                    {fmt(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes + Totals */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div className="w-full md:w-1/2">
            {data.notes && (
              <>
                <h3 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  {t('invoice-generator.previewNotesAndTerms')}
                </h3>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-gray-600">
                  {data.notes}
                </p>
              </>
            )}
          </div>

          <div
            className="w-full space-y-2 rounded-xl border p-4 md:w-2/5"
            style={
              isModern
                ? {background: theme.bg, borderColor: theme.ring}
                : {background: '#f9fafb', borderColor: '#f3f4f6'}
            }
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-gray-600">
                {t('invoice-generator.previewSubtotal')}
              </span>
              <span className="truncate text-xs font-medium text-gray-900 tabular-nums">
                {fmt(totals.subtotal)}
              </span>
            </div>

            {data.discountAmount > 0 && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-gray-600">
                  {t('invoice-generator.previewDiscount')}
                </span>
                <span className="text-xs font-medium text-gray-900 tabular-nums">
                  −{fmt(data.discountAmount)}
                </span>
              </div>
            )}

            {data.taxRate > 0 && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-gray-600">
                  {t('invoice-generator.previewTax')} ({data.taxRate}%)
                </span>
                <span className="text-xs font-medium text-gray-900 tabular-nums">
                  {fmt(totals.tax)}
                </span>
              </div>
            )}

            <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-gray-900 pt-2">
              <span className="text-xs font-bold tracking-wider text-gray-900 uppercase">
                {t('invoice-generator.previewTotal')}
              </span>
              <span
                className="truncate text-lg font-black tabular-nums"
                style={{color: isModern ? theme.hex : '#111827'}}
              >
                {fmt(totals.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
