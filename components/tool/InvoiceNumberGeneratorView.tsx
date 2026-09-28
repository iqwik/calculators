'use client'

import {Plus, RotateCcw, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useMemo, useState} from 'react'
import {Button} from '../ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {Input} from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface GeneratedEntry {
  id: string
  number: string
  date: string
  client: string
  notes: string
  createdAt: number
}

interface SavedState {
  prefix: string
  start: number
  padding: number
  entries: GeneratedEntry[]
}

const STORAGE_KEY = 'invoice-number-generator-v2'

const DEFAULTS: SavedState = {
  prefix: 'INV-',
  start: 1001,
  padding: 0,
  entries: [],
}

function formatNumber(prefix: string, n: number, padding: number): string {
  return `${prefix}${String(n).padStart(padding, '0')}`
}

function extractNumber(value: string, prefix: string): number | null {
  if (!value.startsWith(prefix)) return null
  const tail = value.slice(prefix.length)
  const n = Number(tail)
  return Number.isFinite(n) ? n : null
}

function nextAvailable(state: SavedState): number {
  if (state.entries.length === 0) return state.start
  let max = state.start - 1
  for (const e of state.entries) {
    const n = extractNumber(e.number, state.prefix)
    if (n !== null && n > max) max = n
  }
  return max + 1
}

function lastUsed(state: SavedState): GeneratedEntry | null {
  if (state.entries.length === 0) return null
  return (
    [...state.entries]
      .filter(e => e.number.startsWith(state.prefix))
      .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
  )
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function InvoiceNumberGeneratorView() {
  const t = useTranslations('config')

  const [state, setState] = useState<SavedState>(DEFAULTS)
  const [hydrated, setHydrated] = useState(false)

  const [client, setClient] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<SavedState>
        setState({...DEFAULTS, ...parsed})
      } catch {
        // ignore corrupted
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const next = useMemo(() => nextAvailable(state), [state])
  const nextFormatted = useMemo(
    () => formatNumber(state.prefix, next, state.padding),
    [state.prefix, next, state.padding],
  )
  const last = useMemo(() => lastUsed(state), [state])

  const sortedEntries = useMemo(
    () => [...state.entries].sort((a, b) => b.createdAt - a.createdAt),
    [state.entries],
  )

  function handleGenerate() {
    const number = formatNumber(state.prefix, next, state.padding)
    const entry: GeneratedEntry = {
      id: crypto.randomUUID(),
      number,
      date: todayIso(),
      client: client.trim(),
      notes: notes.trim(),
      createdAt: Date.now(),
    }
    setState(prev => ({...prev, entries: [...prev.entries, entry]}))
    setClient('')
    setNotes('')
  }

  function handleDelete(id: string) {
    setState(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== id),
    }))
  }

  function handleReset() {
    setState(DEFAULTS)
  }

  return (
    <div className="space-y-5">
      {/* Top block: prefix + starting number + generate button */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div className="space-y-1.5">
            <label htmlFor="inv-prefix" className="text-sm font-medium">
              {t('invoice-number-generator.prefixLabel')}
            </label>
            <Input
              id="inv-prefix"
              value={state.prefix}
              onChange={e =>
                setState(prev => ({...prev, prefix: e.target.value}))
              }
              placeholder="INV-"
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inv-start" className="text-sm font-medium">
              {t('invoice-number-generator.startLabel')}
            </label>
            <Input
              id="inv-start"
              type="number"
              min={0}
              value={state.start}
              onChange={e =>
                setState(prev => ({
                  ...prev,
                  start: Number(e.target.value) || 0,
                }))
              }
              className="tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inv-padding" className="text-sm font-medium">
              {t('invoice-number-generator.paddingLabel')}
            </label>
            <Select
              items={[
                {value: '0', label: t('invoice-number-generator.padding.none')},
                {value: '2', label: '2'},
                {value: '3', label: '3'},
                {value: '4', label: '4'},
                {value: '5', label: '5'},
              ]}
              value={String(state.padding)}
              onValueChange={v =>
                setState(prev => ({...prev, padding: Number(v ?? '0')}))
              }
            >
              <SelectTrigger id="inv-padding" className="w-full" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  {t('invoice-number-generator.padding.none')}
                </SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end sm:col-span-2 lg:col-span-1 pb-1.5">
            <Button
              size="default"
              type="button"
              onClick={handleGenerate}
              className="w-full lg:w-auto"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {t('invoice-number-generator.generateNext')}
            </Button>
          </div>
        </div>

        {/* Next available card */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase dark:text-emerald-300">
              {t('invoice-number-generator.nextAvailable')}
            </div>
            <div className="mt-0.5 font-mono text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {nextFormatted}
            </div>
          </div>
          {last && (
            <div className="text-sm text-muted-foreground">
              {t('invoice-number-generator.lastUsedLabel')}:{' '}
              <span className="font-mono font-semibold text-foreground">
                {last.number}
              </span>
            </div>
          )}
        </div>

        {/* Client + Notes */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            value={client}
            onChange={e => setClient(e.target.value)}
            placeholder={t('invoice-number-generator.clientPlaceholder')}
          />
          <Input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('invoice-number-generator.notesPlaceholder')}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <h3 className="text-sm font-semibold">
            {t('invoice-number-generator.generatedTitle', {
              count: sortedEntries.length,
            })}
          </h3>
          <span className="text-xs text-muted-foreground">
            {t('invoice-number-generator.storedInBrowser')}
          </span>
        </div>

        {sortedEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-semibold">
                    {t('invoice-number-generator.colNumber')}
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    {t('invoice-number-generator.colDate')}
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    {t('invoice-number-generator.colClientNotes')}
                  </th>
                  <th className="w-12 px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedEntries.map(e => (
                  <tr key={e.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono font-medium">
                      {e.number}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                      {e.date}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {e.client || e.notes ? (
                        <span>
                          {e.client}
                          {e.client && e.notes && (
                            <span className="mx-1.5">·</span>
                          )}
                          {e.notes}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(e.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label={t('invoice-number-generator.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t('invoice-number-generator.emptyState')}
          </div>
        )}

        <div className="flex items-center justify-end border-t px-4 py-3">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  data-testid="reset-button"
                  className="text-destructive hover:text-destructive"
                />
              }
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {t('invoice-number-generator.reset')}
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('invoice-number-generator.resetTitle')}
                </DialogTitle>
                <DialogDescription>
                  {t('invoice-number-generator.confirmReset')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  {t('invoice-number-generator.cancel')}
                </DialogClose>
                <DialogClose
                  render={
                    <Button variant="destructive" onClick={handleReset} />
                  }
                >
                  {t('invoice-number-generator.confirmResetAction')}
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('invoice-number-generator.privacyNote')}
      </p>
    </div>
  )
}
