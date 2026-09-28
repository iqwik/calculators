'use client'

import {cn} from 'cn'
import {format} from 'date-fns'
import {enUS, ru} from 'date-fns/locale'
import {CalendarIcon} from 'lucide-react'
import {useLocale} from 'next-intl'
import {useState} from 'react'
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

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = '—',
  className,
}: Props) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)

  const date = isoToDate(value)
  const dateLocale = locale === 'ru' ? ru : enUS
  const displayFormat = locale === 'ru' ? 'd MMMM yyyy' : 'PPP'

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        <CalendarIcon className="mr-2 size-4 shrink-0" />
        {date ? format(date, displayFormat, {locale: dateLocale}) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          locale={dateLocale}
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
