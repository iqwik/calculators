'use client'

import {cn} from 'cn'
import {Check, Copy} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffectEvent, useState} from 'react'
import {Button} from '../ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProps,
  TooltipTrigger,
} from '../ui/tooltip'

interface Props {
  getValue(): string | undefined
  onSuccess?: () => void
  labelIdle?: string
  labelSuccess?: string
  showLabel?: boolean
  disabled?: boolean
  className?: string
  tooltipSide?: TooltipProps['side']
}

export function CopyButton({
  getValue,
  onSuccess,
  labelIdle,
  labelSuccess,
  className,
  disabled,
  showLabel = true,
  tooltipSide = 'top',
}: Props) {
  const tGlobal = useTranslations('global')

  const [copied, setCopied] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const labelProp =
    labelIdle && labelSuccess ? (copied ? labelSuccess : labelIdle) : undefined
  const label = labelProp || tGlobal(copied ? 'copied' : 'copy')
  const Icon = copied ? Check : Copy

  const handleCopy = useEffectEvent(async () => {
    const text = getValue()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (!showLabel) setTooltipOpen(true)
      setTimeout(() => {
        setCopied(false)
        if (!showLabel) setTooltipOpen(false)
      }, 2000)
    } catch {
      // clipboard может быть недоступен на http
    } finally {
      onSuccess?.()
    }
  })

  const button = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      disabled={disabled}
      className={cn(
        'h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && label && <span>{label}</span>}
    </Button>
  )

  if (!showLabel) {
    return (
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger render={button} />
        <TooltipContent side={tooltipSide}>{label}</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
