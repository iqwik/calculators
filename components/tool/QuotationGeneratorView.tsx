'use client'

import {ExternalLink, FileDown, Plus, RotateCcw, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useMemo, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {DatePicker} from '../ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface LineItem {
  id: string
  description: string
  quantity: number
  price: number
}

interface QuotationData {
  quotationNumber: string
  issueDate: string
  validUntil: string
  subject: string
  currency: string
  fromName: string
  fromEmail: string
  fromPhone: string
  toName: string
  toEmail: string
  toAddress: string
  items: LineItem[]
  taxRate: number
  discountAmount: number
  notes: string
  terms: string
}

interface Totals {
  subtotal: number
  taxable: number
  tax: number
  total: number
}

const STORAGE_KEY = 'quotation-generator-draft-v1'

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

function initialStaticQuotation(): QuotationData {
  return {
    quotationNumber: 'QT-000000-001',
    issueDate: '2025-01-01',
    validUntil: '2025-01-31',
    subject: '',
    currency: 'USD',
    fromName: '',
    fromEmail: '',
    fromPhone: '',
    toName: '',
    toEmail: '',
    toAddress: '',
    items: [{id: 'default-item', description: '', quantity: 1, price: 0}],
    taxRate: 0,
    discountAmount: 0,
    notes: '',
    terms: '',
  }
}

function freshQuotation(): QuotationData {
  const today = new Date()
  const valid = new Date()
  valid.setDate(valid.getDate() + 30)
  const iso = (d: Date) => d.toISOString().slice(0, 10)

  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 900) + 100)

  return {
    ...initialStaticQuotation(),
    quotationNumber: `QT-${y}${m}-${rand}`,
    issueDate: iso(today),
    validUntil: iso(valid),
    items: [{id: crypto.randomUUID(), description: '', quantity: 1, price: 0}],
  }
}

function newItem(): LineItem {
  return {id: crypto.randomUUID(), description: '', quantity: 1, price: 0}
}

export function QuotationGeneratorView() {
  const t = useTranslations('config')

  const [data, setData] = useState<QuotationData>(initialStaticQuotation)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<QuotationData>
        setData(prev => ({...prev, ...parsed}))
        setHydrated(true)
        return
      } catch {
        // ignore
      }
    }
    setData(freshQuotation())
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

  function update<K extends keyof QuotationData>(
    key: K,
    value: QuotationData[K],
  ) {
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

  function handleReset() {
    if (!confirm(t('quotation-generator.confirmReset'))) return
    setData(freshQuotation())
  }

  function handlePrint() {
    window.print()
  }

  const currencySymbol = CURRENCY_SYMBOLS[data.currency] ?? data.currency

  function handleOpenPreview() {
    const previewEl = document.getElementById('quotation-preview')
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
          <title>${data.quotationNumber || 'Quotation'}</title>
          ${styles}
          <style>
            html, body { margin: 0; padding: 0; background: #fff; font-family: system-ui, -apple-system, sans-serif; }
            #quotation-preview { width: 100%; min-height: 100vh; border-radius: 0 !important; border: none !important; box-shadow: none !important; }
            @media print { body { background: #fff; } #quotation-preview { width: 100%; min-height: auto; } }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 p-2 backdrop-blur print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            {t('quotation-generator.preview')}
          </Button>
          <Button type="button" size="sm" onClick={handlePrint}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            {t('quotation-generator.downloadPdf')}
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
          {t('quotation-generator.reset')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] print:block">
        {/* FORM */}
        <div className="space-y-3 print:hidden">
          {/* From / To */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Section title={t('quotation-generator.from')}>
              <div className="space-y-2">
                <Input
                  value={data.fromName}
                  onChange={e => update('fromName', e.target.value)}
                  placeholder={t('quotation-generator.companyName')}
                  className="h-9"
                />
                <Input
                  type="email"
                  value={data.fromEmail}
                  onChange={e => update('fromEmail', e.target.value)}
                  placeholder={t('quotation-generator.email')}
                  className="h-9"
                />
                <Input
                  value={data.fromPhone}
                  onChange={e => update('fromPhone', e.target.value)}
                  placeholder={t('quotation-generator.phone')}
                  className="h-9"
                />
              </div>
            </Section>

            <Section title={t('quotation-generator.preparedFor')}>
              <div className="space-y-2">
                <Input
                  value={data.toName}
                  onChange={e => update('toName', e.target.value)}
                  placeholder={t('quotation-generator.clientName')}
                  className="h-9"
                />
                <Input
                  type="email"
                  value={data.toEmail}
                  onChange={e => update('toEmail', e.target.value)}
                  placeholder={t('quotation-generator.clientEmail')}
                  className="h-9"
                />
                <textarea
                  value={data.toAddress}
                  onChange={e => update('toAddress', e.target.value)}
                  placeholder={t('quotation-generator.clientAddress')}
                  rows={2}
                  className="w-full resize-none rounded-lg border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </Section>
          </div>

          {/* Meta */}
          <Section title={t('quotation-generator.details')}>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="qt-number">
                  {t('quotation-generator.quotationNumber')}
                </FieldLabel>
                <Input
                  id="qt-number"
                  value={data.quotationNumber}
                  onChange={e => update('quotationNumber', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="qt-issue">
                  {t('quotation-generator.issueDate')}
                </FieldLabel>
                <DatePicker
                  id="qt-issue"
                  value={data.issueDate}
                  onChange={v => update('issueDate', v)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="qt-valid">
                  {t('quotation-generator.validUntil')}
                </FieldLabel>
                <DatePicker
                  id="qt-valid"
                  value={data.validUntil}
                  onChange={v => update('validUntil', v)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold whitespace-nowrap text-muted-foreground">
                  {t('quotation-generator.currency')}
                </span>
                <Select
                  items={CURRENCIES.map(c => ({
                    value: c,
                    label: `${c} (${CURRENCY_SYMBOLS[c] ?? c})`,
                  }))}
                  value={data.currency}
                  onValueChange={v => update('currency', v ?? '')}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c} value={c}>
                        {c} ({CURRENCY_SYMBOLS[c] ?? c})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <FieldLabel htmlFor="qt-subject">
                {t('quotation-generator.subject')}
              </FieldLabel>
              <Input
                id="qt-subject"
                value={data.subject}
                onChange={e => update('subject', e.target.value)}
                placeholder={t('quotation-generator.subjectPlaceholder')}
                className="h-9"
              />
            </div>
          </Section>

          {/* Line Items */}
          <Section
            title={t('quotation-generator.lineItems')}
            subtitle={t('quotation-generator.lineItemsHint')}
          >
            <div className="mb-2 hidden grid-cols-[minmax(0,1fr)_72px_110px_96px_36px] gap-2 px-1 md:grid">
              <ColLabel>{t('quotation-generator.itemDescription')}</ColLabel>
              <ColLabel align="center">{t('quotation-generator.qty')}</ColLabel>
              <ColLabel align="right">
                {t('quotation-generator.price')}
              </ColLabel>
              <ColLabel align="right">
                {t('quotation-generator.amount')}
              </ColLabel>
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
                      placeholder={t('quotation-generator.itemDescription')}
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
                      aria-label={t('quotation-generator.removeItem')}
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
              {t('quotation-generator.addNewItem')}
            </Button>
          </Section>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Section title={t('quotation-generator.notes')}>
              <textarea
                value={data.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder={t('quotation-generator.notesPlaceholder')}
                rows={3}
                className="w-full resize-none rounded-lg border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Section>
            <Section title={t('quotation-generator.terms')}>
              <textarea
                value={data.terms}
                onChange={e => update('terms', e.target.value)}
                placeholder={t('quotation-generator.termsPlaceholder')}
                rows={3}
                className="w-full resize-none rounded-lg border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Section>
          </div>

          {/* Totals */}
          <Section title={t('quotation-generator.summary')}>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  {t('quotation-generator.subtotal')}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {currencySymbol}
                  {totals.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="qt-discount"
                  className="text-sm text-muted-foreground"
                >
                  {t('quotation-generator.discountAmount')}
                </label>
                <Input
                  id="qt-discount"
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
                  htmlFor="qt-tax"
                  className="text-sm text-muted-foreground"
                >
                  {t('quotation-generator.taxRate')}
                </label>
                <Input
                  id="qt-tax"
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
                  {t('quotation-generator.total')}
                </span>
                <span className="text-2xl font-black tabular-nums">
                  {currencySymbol}
                  {totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* PREVIEW — desktop sticky */}
        <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start print:static print:block">
          <QuotationPreview data={data} totals={totals} />
        </div>
      </div>
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

interface QuotationPreviewProps {
  data: QuotationData
  totals: Totals
}

function QuotationPreview({data, totals}: QuotationPreviewProps) {
  const t = useTranslations('config')
  const symbol = CURRENCY_SYMBOLS[data.currency] ?? data.currency

  const fmt = (n: number) =>
    `${symbol}${n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return (
    <div
      id="quotation-preview"
      className="relative overflow-hidden rounded-2xl border bg-white text-gray-900 shadow-sm"
      style={{minHeight: '700px'}}
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <div className="text-lg font-extrabold tracking-tight text-gray-900">
              {data.fromName || t('quotation-generator.previewYourCompany')}
            </div>
            {data.fromEmail && (
              <p className="mt-0.5 text-xs text-gray-500">{data.fromEmail}</p>
            )}
            {data.fromPhone && (
              <p className="mt-0.5 text-xs text-gray-500">{data.fromPhone}</p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <h2 className="mb-3 text-3xl font-black tracking-tight text-gray-900 uppercase">
              {t('quotation-generator.previewTitle')}
            </h2>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-right text-xs">
              <span className="font-semibold tracking-wide whitespace-nowrap text-gray-400 uppercase">
                {t('quotation-generator.previewNumber')}
              </span>
              <span className="font-bold text-gray-900">
                {data.quotationNumber}
              </span>

              <span className="font-semibold tracking-wide whitespace-nowrap text-gray-400 uppercase">
                {t('quotation-generator.previewDate')}
              </span>
              <span className="font-bold text-gray-900">{data.issueDate}</span>

              <span className="font-semibold tracking-wide whitespace-nowrap text-gray-400 uppercase">
                {t('quotation-generator.previewValid')}
              </span>
              <span className="font-bold text-gray-900">{data.validUntil}</span>
            </div>
          </div>
        </div>

        {/* Subject */}
        {data.subject && (
          <div className="mb-6">
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {t('quotation-generator.previewSubject')}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {data.subject}
            </div>
          </div>
        )}

        {/* Prepared For */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            {t('quotation-generator.previewPreparedFor')}
          </h3>
          <p className="text-base font-bold text-gray-900">
            {data.toName || t('quotation-generator.previewClientFallback')}
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

        {/* Items */}
        <div className="mb-6">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-900">
                <th className="py-2 pr-3 text-[10px] font-bold tracking-wider text-gray-900 uppercase">
                  {t('quotation-generator.previewDescription')}
                </th>
                <th
                  className="py-2 text-center text-[10px] font-bold tracking-wider text-gray-900 uppercase"
                  style={{width: '40px'}}
                >
                  {t('quotation-generator.previewQty')}
                </th>
                <th
                  className="py-2 text-right text-[10px] font-bold tracking-wider text-gray-900 uppercase"
                  style={{width: '90px'}}
                >
                  {t('quotation-generator.previewRate')}
                </th>
                <th
                  className="py-2 text-right text-[10px] font-bold tracking-wider text-gray-900 uppercase"
                  style={{width: '90px'}}
                >
                  {t('quotation-generator.previewAmount')}
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
                            'quotation-generator.previewItemDescriptionPlaceholder',
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

        {/* Notes / Terms + Totals */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div className="w-full space-y-4 md:w-1/2">
            {data.notes && (
              <div>
                <h3 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  {t('quotation-generator.previewNotes')}
                </h3>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-gray-600">
                  {data.notes}
                </p>
              </div>
            )}
            {data.terms && (
              <div>
                <h3 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  {t('quotation-generator.previewTerms')}
                </h3>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-gray-600">
                  {data.terms}
                </p>
              </div>
            )}
          </div>

          <div className="w-full space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 md:w-2/5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-gray-600">
                {t('quotation-generator.previewSubtotal')}
              </span>
              <span className="truncate text-xs font-medium text-gray-900 tabular-nums">
                {fmt(totals.subtotal)}
              </span>
            </div>

            {data.discountAmount > 0 && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-gray-600">
                  {t('quotation-generator.previewDiscount')}
                </span>
                <span className="text-xs font-medium text-gray-900 tabular-nums">
                  −{fmt(data.discountAmount)}
                </span>
              </div>
            )}

            {data.taxRate > 0 && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-gray-600">
                  {t('quotation-generator.previewTax')} ({data.taxRate}%)
                </span>
                <span className="text-xs font-medium text-gray-900 tabular-nums">
                  {fmt(totals.tax)}
                </span>
              </div>
            )}

            <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-gray-900 pt-2">
              <span className="text-xs font-bold tracking-wider text-gray-900 uppercase">
                {t('quotation-generator.previewTotal')}
              </span>
              <span className="truncate text-lg font-black text-gray-900 tabular-nums">
                {fmt(totals.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
