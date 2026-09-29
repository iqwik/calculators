'use client'

import {cn} from 'cn'
import {useState} from 'react'
import {HexColorPicker} from 'react-colorful'
import {Button} from './button'
import {Popover, PopoverContent, PopoverTrigger} from './popover'

interface Props {
  id?: string
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

function normalizeHex(value: string): string {
  const v = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(v)) return v
  if (/^#[0-9a-f]{3}$/.test(v)) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
  }
  return '#000000'
}

export function ColorPicker({id, value, onChange, className, disabled}: Props) {
  const [open, setOpen] = useState(false)
  const safeValue = normalizeHex(value)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <div style={{display: 'contents'}}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn('h-9 w-full justify-start gap-2 p-1', className)}
            />
          }
        >
          <span
            className="h-full w-full rounded-md border"
            style={{background: safeValue}}
          />
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-3" align="start">
        <HexColorPicker color={safeValue} onChange={onChange} />
        <div className="mt-3 flex items-center gap-2">
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            className="h-8 w-full rounded-md border bg-background px-2 font-mono text-xs uppercase outline-none focus:ring-2 focus:ring-primary/30"
            spellCheck={false}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
