'use client'

import {useEffect, useRef, useState} from 'react'

export function useSmoothProgress(target: number, speed = 0.18): number {
  const [display, setDisplay] = useState(target)
  const displayRef = useRef(target)
  const targetRef = useRef(target)
  const rafRef = useRef<number | null>(null)

  targetRef.current = target
  displayRef.current = display

  useEffect(() => {
    // Если цель ниже отображения (сброс к 0) — мгновенно догоняем
    if (target < displayRef.current) {
      displayRef.current = target
      setDisplay(target)
      return
    }

    let active = true

    const tick = () => {
      if (!active) return
      const diff = targetRef.current - displayRef.current
      if (Math.abs(diff) < 0.5) {
        displayRef.current = targetRef.current
        setDisplay(targetRef.current)
        rafRef.current = null
        return
      }
      displayRef.current += diff * speed
      setDisplay(displayRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => {
      active = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [target, speed])

  return Math.round(display)
}
