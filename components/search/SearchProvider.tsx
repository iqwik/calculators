'use client'

import type {ReactNode} from 'react'
import {createContext, useContext, useEffect, useState} from 'react'
import {SearchModal} from './SearchModal'

interface SearchContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider')
  return ctx
}

export function SearchProvider({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <SearchContext.Provider value={{open, setOpen}}>
      {children}
      <SearchModal open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  )
}
