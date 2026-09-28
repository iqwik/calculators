'use client'

import {cn} from 'cn'
import {enUS, ru} from 'date-fns/locale'
import {CalendarIcon} from 'lucide-react'
import {useLocale} from 'next-intl'
import {useEffect, useState} from 'react'
import {Button} from './button'
import {Calendar} from './calendar'
import {Popover, PopoverContent, PopoverTrigger} from './popover'

interface Props {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function dateToIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function pickDisplayLocale(appLocale: string): string {
  if (typeof navigator === 'undefined') {
    return appLocale === 'ru' ? 'ru-RU' : 'en-US'
  }

  const langs =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language]

  const match = langs.find(l => l.toLowerCase().startsWith(appLocale))
  return match ?? langs[0] ?? 'en-US'
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = '—',
  className,
}: Props) {
  const appLocale = useLocale()
  const [displayLocale, setDisplayLocale] = useState<string>(
    appLocale === 'ru' ? 'ru-RU' : 'en-US',
  )
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setDisplayLocale(pickDisplayLocale(appLocale))
  }, [appLocale])

  const calendarLocale = appLocale === 'ru' ? ru : enUS

  function formatDate(date: Date): string {
    try {
      return new Intl.DateTimeFormat(displayLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date)
    } catch {
      return date.toISOString().slice(0, 10)
    }
  }

  const date = isoToDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <div style={{display: 'contents'}}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground',
                className,
              )}
            />
          }
        >
          <CalendarIcon className="size-4 shrink-0" />
          {date ? formatDate(date) : placeholder}
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          locale={calendarLocale}
          onSelect={next => {
            onChange(next ? dateToIso(next) : '')
            setOpen(false)
          }}
          autoFocus
        />
        {date && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
