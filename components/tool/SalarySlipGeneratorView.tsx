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
  label: string
  amount: number
}

interface SalarySlipData {
  companyName: string
  companyAddress: string
  employeeName: string
  employeeId: string
  designation: string
  department: string
  joiningDate: string
  payPeriod: string
  currency: string
  earnings: LineItem[]
  deductions: LineItem[]
  netPayWords: string
}

const STORAGE_KEY = 'payslip-generator-draft-v1'

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

function newItem(label = '', amount = 0): LineItem {
  return {id: crypto.randomUUID(), label, amount}
}

function initialStaticSlip(): SalarySlipData {
  return {
    companyName: '',
    companyAddress: '',
    employeeName: '',
    employeeId: '',
    designation: '',
    department: '',
    joiningDate: '',
    payPeriod: '',
    currency: 'USD',
    earnings: [
      newItem('Basic', 0),
      newItem('HRA', 0),
      newItem('Conveyance', 0),
      newItem('Special Allowance', 0),
    ],
    deductions: [
      newItem('Provident Fund', 0),
      newItem('Professional Tax', 0),
      newItem('Income Tax (TDS)', 0),
    ],
    netPayWords: '',
  }
}

function freshSlip(): SalarySlipData {
  const now = new Date()
  const month = now.toLocaleString('en-US', {month: 'long', year: 'numeric'})
  return {
    ...initialStaticSlip(),
    payPeriod: month,
  }
}

export function SalarySlipGeneratorView() {
  const t = useTranslations('config')

  const [data, setData] = useState<SalarySlipData>(initialStaticSlip)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<SalarySlipData>
        setData(prev => ({...prev, ...parsed}))
        setHydrated(true)
        return
      } catch {
        // ignore
      }
    }
    setData(freshSlip())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data, hydrated])

  const totals = useMemo(() => {
    const gross = data.earnings.reduce((s, i) => s + (i.amount || 0), 0)
    const deductions = data.deductions.reduce((s, i) => s + (i.amount || 0), 0)
    const net = gross - deductions
    return {gross, deductions, net}
  }, [data.earnings, data.deductions])

  function update<K extends keyof SalarySlipData>(
    key: K,
    value: SalarySlipData[K],
  ) {
    setData(prev => ({...prev, [key]: value}))
  }

  function updateItem(
    list: 'earnings' | 'deductions',
    id: string,
    patch: Partial<LineItem>,
  ) {
    setData(prev => ({
      ...prev,
      [list]: prev[list].map(i => (i.id === id ? {...i, ...patch} : i)),
    }))
  }

  function addItem(list: 'earnings' | 'deductions') {
    setData(prev => ({...prev, [list]: [...prev[list], newItem()]}))
  }

  function removeItem(list: 'earnings' | 'deductions', id: string) {
    setData(prev => ({
      ...prev,
      [list]: prev[list].filter(i => i.id !== id),
    }))
  }

  function handleReset() {
    if (!confirm(t('payslip-generator.confirmReset'))) return
    setData(freshSlip())
  }

  function handlePrint() {
    window.print()
  }

  const currencySymbol = CURRENCY_SYMBOLS[data.currency] ?? data.currency

  function handleOpenPreview() {
    const previewEl = document.getElementById('salary-slip-preview')
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
          <title>Salary Slip</title>
          ${styles}
          <style>
            html, body { margin: 0; padding: 0; background: #fff; font-family: system-ui, -apple-system, sans-serif; }
            #salary-slip-preview { width: 100%; min-height: 100vh; border-radius: 0 !important; border: none !important; box-shadow: none !important; }
            @media print { body { background: #fff; } #salary-slip-preview { width: 100%; min-height: auto; } }
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
            {t('payslip-generator.preview')}
          </Button>
          <Button type="button" size="sm" onClick={handlePrint}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            {t('payslip-generator.downloadPdf')}
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
          {t('payslip-generator.reset')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] print:block">
        {/* FORM */}
        <div className="space-y-3 print:hidden">
          {/* Company + Currency */}
          <Section title={t('payslip-generator.company')}>
            <div className="space-y-2">
              <Input
                value={data.companyName}
                onChange={e => update('companyName', e.target.value)}
                placeholder={t('payslip-generator.companyName')}
                className="h-9"
              />
              <textarea
                value={data.companyAddress}
                onChange={e => update('companyAddress', e.target.value)}
                placeholder={t('payslip-generator.companyAddress')}
                rows={2}
                className="w-full resize-none rounded-lg border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </Section>

          {/* Employee */}
          <Section title={t('payslip-generator.employee')}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="sl-name">
                  {t('payslip-generator.employeeName')}
                </FieldLabel>
                <Input
                  id="sl-name"
                  value={data.employeeName}
                  onChange={e => update('employeeName', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="sl-id">
                  {t('payslip-generator.employeeId')}
                </FieldLabel>
                <Input
                  id="sl-id"
                  value={data.employeeId}
                  onChange={e => update('employeeId', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="sl-designation">
                  {t('payslip-generator.designation')}
                </FieldLabel>
                <Input
                  id="sl-designation"
                  value={data.designation}
                  onChange={e => update('designation', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="sl-department">
                  {t('payslip-generator.department')}
                </FieldLabel>
                <Input
                  id="sl-department"
                  value={data.department}
                  onChange={e => update('department', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="sl-joining">
                  {t('payslip-generator.joiningDate')}
                </FieldLabel>
                <DatePicker
                  id="sl-joining"
                  value={data.joiningDate}
                  onChange={v => update('joiningDate', v)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="sl-period">
                  {t('payslip-generator.payPeriod')}
                </FieldLabel>
                <Input
                  id="sl-period"
                  value={data.payPeriod}
                  onChange={e => update('payPeriod', e.target.value)}
                  placeholder="January 2025"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <span className="block text-xs font-semibold whitespace-nowrap text-muted-foreground">
                  {t('payslip-generator.currency')}
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
          </Section>

          {/* Earnings */}
          <Section
            title={t('payslip-generator.earnings')}
            subtitle={t('payslip-generator.earningsHint')}
          >
            <div className="space-y-2">
              {data.earnings.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_140px_36px]"
                >
                  <Input
                    value={item.label}
                    onChange={e =>
                      updateItem('earnings', item.id, {label: e.target.value})
                    }
                    placeholder={t('payslip-generator.itemLabel')}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.amount}
                    onChange={e =>
                      updateItem('earnings', item.id, {
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="h-9 text-right tabular-nums"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem('earnings', item.id)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    aria-label={t('payslip-generator.removeItem')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItem('earnings')}
              className="mt-3"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t('payslip-generator.addEarning')}
            </Button>

            <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-sm font-medium">
                {t('payslip-generator.grossEarnings')}
              </span>
              <span className="font-semibold tabular-nums">
                {currencySymbol}
                {totals.gross.toFixed(2)}
              </span>
            </div>
          </Section>

          {/* Deductions */}
          <Section
            title={t('payslip-generator.deductions')}
            subtitle={t('payslip-generator.deductionsHint')}
          >
            <div className="space-y-2">
              {data.deductions.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_140px_36px]"
                >
                  <Input
                    value={item.label}
                    onChange={e =>
                      updateItem('deductions', item.id, {label: e.target.value})
                    }
                    placeholder={t('payslip-generator.itemLabel')}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.amount}
                    onChange={e =>
                      updateItem('deductions', item.id, {
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="h-9 text-right tabular-nums"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem('deductions', item.id)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    aria-label={t('payslip-generator.removeItem')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItem('deductions')}
              className="mt-3"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t('payslip-generator.addDeduction')}
            </Button>

            <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-sm font-medium">
                {t('payslip-generator.totalDeductions')}
              </span>
              <span className="font-semibold tabular-nums">
                {currencySymbol}
                {totals.deductions.toFixed(2)}
              </span>
            </div>
          </Section>

          {/* Net Pay words */}
          <Section title={t('payslip-generator.netPayWords')}>
            <Input
              value={data.netPayWords}
              onChange={e => update('netPayWords', e.target.value)}
              placeholder={t('payslip-generator.netPayWordsPlaceholder')}
              className="h-9"
            />
          </Section>

          {/* Net Pay summary */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold">
                {t('payslip-generator.netPay')}
              </span>
              <span className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                {currencySymbol}
                {totals.net.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start print:static print:block">
          <SalarySlipPreview data={data} totals={totals} />
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

interface PreviewProps {
  data: SalarySlipData
  totals: {gross: number; deductions: number; net: number}
}

function SalarySlipPreview({data, totals}: PreviewProps) {
  const t = useTranslations('config')
  const symbol = CURRENCY_SYMBOLS[data.currency] ?? data.currency

  const fmt = (n: number) =>
    `${symbol}${n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return (
    <div
      id="salary-slip-preview"
      className="relative overflow-hidden rounded-2xl border bg-white text-gray-900 shadow-sm"
      style={{minHeight: '700px'}}
    >
      <div className="p-6 md:p-8">
        {/* Company header */}
        <div className="mb-6 border-b pb-4">
          <div className="text-lg font-extrabold tracking-tight text-gray-900">
            {data.companyName || t('payslip-generator.previewCompanyFallback')}
          </div>
          {data.companyAddress && (
            <p className="mt-0.5 text-xs leading-relaxed whitespace-pre-wrap text-gray-500">
              {data.companyAddress}
            </p>
          )}
          <h2 className="mt-3 text-center text-xl font-black tracking-widest text-gray-900 uppercase">
            {t('payslip-generator.previewTitle')}
          </h2>
        </div>

        {/* Employee details */}
        <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <Row
            label={t('payslip-generator.employeeName')}
            value={data.employeeName}
          />
          <Row
            label={t('payslip-generator.employeeId')}
            value={data.employeeId}
          />
          <Row
            label={t('payslip-generator.designation')}
            value={data.designation}
          />
          <Row
            label={t('payslip-generator.department')}
            value={data.department}
          />
          <Row
            label={t('payslip-generator.joiningDate')}
            value={data.joiningDate}
          />
          <Row
            label={t('payslip-generator.payPeriod')}
            value={data.payPeriod}
          />
        </div>

        {/* Earnings / Deductions table */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Earnings */}
          <div className="overflow-hidden rounded-lg border">
            <div className="bg-gray-100 px-3 py-2 text-[10px] font-bold tracking-widest text-gray-700 uppercase">
              {t('payslip-generator.earnings')}
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {data.earnings.map(item => (
                  <tr key={item.id}>
                    <td className="px-3 py-1.5 text-gray-700">
                      {item.label || '—'}
                    </td>
                    <td className="px-3 py-1.5 text-right font-medium text-gray-900 tabular-nums">
                      {fmt(item.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-300 bg-gray-50 font-semibold">
                  <td className="px-3 py-1.5 text-gray-900">
                    {t('payslip-generator.grossEarnings')}
                  </td>
                  <td className="px-3 py-1.5 text-right text-gray-900 tabular-nums">
                    {fmt(totals.gross)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deductions */}
          <div className="overflow-hidden rounded-lg border">
            <div className="bg-gray-100 px-3 py-2 text-[10px] font-bold tracking-widest text-gray-700 uppercase">
              {t('payslip-generator.deductions')}
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100">
                {data.deductions.map(item => (
                  <tr key={item.id}>
                    <td className="px-3 py-1.5 text-gray-700">
                      {item.label || '—'}
                    </td>
                    <td className="px-3 py-1.5 text-right font-medium text-gray-900 tabular-nums">
                      {fmt(item.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-300 bg-gray-50 font-semibold">
                  <td className="px-3 py-1.5 text-gray-900">
                    {t('payslip-generator.totalDeductions')}
                  </td>
                  <td className="px-3 py-1.5 text-right text-gray-900 tabular-nums">
                    {fmt(totals.deductions)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Net Pay */}
        <div className="rounded-lg border border-gray-900 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
              {t('payslip-generator.netPay')}
            </span>
            <span className="text-2xl font-black text-gray-900 tabular-nums">
              {fmt(totals.net)}
            </span>
          </div>
          {data.netPayWords && (
            <p className="mt-1.5 text-xs text-gray-600 italic">
              {data.netPayWords}
            </p>
          )}
        </div>

        {/* Signature */}
        <div className="mt-10 flex justify-between gap-6 text-xs">
          <div className="flex-1 border-t border-gray-400 pt-1.5 text-center text-gray-500">
            {t('payslip-generator.signatureEmployee')}
          </div>
          <div className="flex-1 border-t border-gray-400 pt-1.5 text-center text-gray-500">
            {t('payslip-generator.signatureEmployer')}
          </div>
        </div>
      </div>
    </div>
  )
}

interface RowProps {
  label: string
  value: string
}

function Row({label, value}: RowProps) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 font-semibold text-gray-500">{label}:</span>
      <span className="truncate font-medium text-gray-900">{value || '—'}</span>
    </div>
  )
}
