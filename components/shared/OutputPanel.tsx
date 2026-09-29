'use client'

import {cn} from 'cn'
import {Download} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {type ReactNode} from 'react'
import {useEvent} from '@/hooks/use-event'
import {Button} from '../ui/button'
import {CopyButton} from './CopyButton'

interface Props {
  title?: string
  value?: string
  /** Кастомный рендер содержимого вместо plain text */
  children?: ReactNode
  /** Отключить кнопку копирования */
  disableCopy?: boolean
  /** Дополнительный action справа от Copy (например, Download) */
  actions?: ReactNode
  /** Класс высоты панели, по умолчанию min-h-[280px] */
  heightClass?: string
  /** Дополнительный класс для контейнера содержимого */
  contentClassName?: string
  /** Не оборачивать содержимое в whitespace-pre-wrap (для JSX-контента) */
  rawContent?: boolean

  onDownload?: () => void
  downloadLabel?: ReactNode
  disableDownload?: boolean
}

export function OutputPanel({
  title,
  value,
  children,
  disableCopy = false,
  actions,
  heightClass = 'min-h-[280px]',
  contentClassName,
  rawContent = false,
  onDownload,
  downloadLabel,
  disableDownload,
}: Props) {
  const getValue = useEvent(() => value)
  const tGlobal = useTranslations('global')

  const empty = !value && !children

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-card',
        heightClass,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-muted/60">
        {title && (
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            {title}
          </span>
        )}
        <div className="flex items-center gap-1">
          {actions}
          {value && !disableCopy && (
            <CopyButton
              getValue={getValue}
              disabled={!value}
              className="h-7 gap-1.5 px-2"
            />
          )}
          {onDownload && (
            <Button
              size="sm"
              variant="ghost"
              disabled={disableDownload}
              onClick={onDownload}
              className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloadLabel ?? tGlobal('download')}</span>
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex-1 overflow-auto p-4 text-sm leading-relaxed',
          rawContent ? '' : 'whitespace-pre-wrap wrap-break-word',
          contentClassName,
        )}
      >
        {children ?? (empty ? null : value)}
      </div>
    </div>
  )
}
