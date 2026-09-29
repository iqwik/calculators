import {
  Briefcase,
  Calculator,
  Code2,
  FileText,
  HeartPulse,
  Zap,
} from 'lucide-react'
import type {CategorySlug} from '@/types'

interface Props {
  slug: CategorySlug
  className?: string
}

const ICONS: Record<CategorySlug, React.ComponentType<{className?: string}>> = {
  // finance: Wallet,
  finance: Calculator,
  health: HeartPulse,
  text: FileText,
  developer: Code2,
  generators: Zap,
  business: Briefcase,
}

export function CategoryIcon({slug, className}: Props) {
  const Icon = ICONS[slug]
  return <Icon className={className} />
}
