'use client'

import {cn} from 'cn'
import {type LucideIcon} from 'lucide-react'
import {type ReactNode} from 'react'

interface Props {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Иконка слева от заголовка */
  icon?: LucideIcon
  /** Класс цвета иконки, по умолчанию amber-500 */
  iconClassName?: string
  /** Кнопки/actions справа от заголовка */
  actions?: ReactNode
  /** Класс высоты, по умолчанию h-[420px] */
  heightClass?: string
  /** Доп. классы для textarea */
  textareaClassName?: string
  /** Моноширинный шрифт, по умолчанию true */
  mono?: boolean
  /** Отключить textarea */
  disabled?: boolean
  /** spellCheck, по умолчанию false */
  spellCheck?: boolean
  /** Дополнительный контент над textarea (внутри header) */
  headerExtra?: ReactNode
}

export function InputPanel({
  title,
  value,
  onChange,
  placeholder,
  icon: Icon,
  iconClassName = 'text-amber-500',
  actions,
  heightClass = 'h-[420px]',
  textareaClassName,
  mono = true,
  disabled = false,
  spellCheck = false,
  headerExtra,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-card',
        heightClass,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b bg-muted/60 px-4 py-2 min-h-11.25">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn('h-3.5 w-3.5', iconClassName)} />}
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            {title}
          </span>
          {headerExtra}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={spellCheck}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex-1 resize-none bg-transparent p-4 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          mono && 'font-mono',
          textareaClassName,
        )}
      />
    </div>
  )
}
