'use client'

import {type ButtonHTMLAttributes, forwardRef, type ReactNode} from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({children, ...props}, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
      >
        {children}
      </button>
    )
  },
)
