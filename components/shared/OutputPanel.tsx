'use client'

import {cn} from 'cn'
import {type ReactNode, useEffectEvent} from 'react'
import {CopyButton} from './CopyButton'

interface Props {
  title: string
  value: string
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
}: Props) {
  const getValue = useEffectEvent(() => value)

  const empty = !value && !children

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-card',
        heightClass,
      )}
    >
      {/* Заголовок-плашка в стиле code-block */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-muted/60">
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          {title}
        </span>
        <div className="flex items-center gap-1">
          {actions}
          {!disableCopy && (
            <CopyButton
              getValue={getValue}
              disabled={!value}
              className="h-7 gap-1.5 px-2"
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex-1 overflow-auto p-4 text-sm leading-relaxed',
          rawContent ? '' : 'whitespace-pre-wrap break-words',
          contentClassName,
        )}
      >
        {children ?? (empty ? null : value)}
      </div>
    </div>
  )
}
