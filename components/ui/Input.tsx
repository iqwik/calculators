'use client'

import {forwardRef} from 'react'
import type {InputField} from '@/types/calculator'

interface InputProps extends Omit<InputField, 'defaultValue'> {
  value: string | number
  error?: string
  onChange: (value: string) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      label,
      type,
      unit,
      placeholder,
      min,
      max,
      step,
      options,
      hint,
      value,
      error,
      onChange,
    },
    ref,
  ) => {
    const baseClasses =
      'w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 transition'
    const stateClasses = error
      ? 'border-red-400 focus:ring-red-300'
      : 'border-gray-300 focus:ring-blue-300 focus:border-blue-400'

    return (
      <div className="space-y-1">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {unit && <span className="text-gray-400 ml-1">({unit})</span>}
        </label>

        <div className="relative">
          {type === 'select' ? (
            <select
              id={name}
              name={name}
              value={value}
              onChange={e => onChange(e.target.value)}
              className={`${baseClasses} ${stateClasses}`}
            >
              {options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={ref}
              id={name}
              name={name}
              type={type}
              value={value}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              onChange={e => onChange(e.target.value)}
              className={`${baseClasses} ${stateClasses}`}
            />
          )}
        </div>

        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)
