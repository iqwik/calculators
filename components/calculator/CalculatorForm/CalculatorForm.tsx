'use client'

import {getCalculator} from '@/data'
import {CalculatorFormContent} from './CalculatorFormContent'

interface CalculatorFormProps {
  category: string
  slug: string
}

export function CalculatorForm({category, slug}: CalculatorFormProps) {
  const config = getCalculator(category, slug)

  if (!config) return null

  return <CalculatorFormContent config={config} />
}
