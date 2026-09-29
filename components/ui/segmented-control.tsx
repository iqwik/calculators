'use client'

import {cn} from 'cn'
import {type LucideIcon} from 'lucide-react'

interface Option<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface Props<T extends string> {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  name: string
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  name,
  className,
}: Props<T>) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-0.5 rounded-md bg-muted p-0.5 text-muted-foreground',
        className,
      )}
    >
      {options.map(opt => {
        const active = opt.value === value
        const Icon = opt.icon
        const id = `${name}-${opt.value}`
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium transition',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'hover:text-foreground',
            )}
          >
            <input
              type="radio"
              id={id}
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {opt.label}
          </label>
        )
      })}
    </div>
  )
}
