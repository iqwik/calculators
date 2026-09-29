'use client'

import {Maximize2, Minimize2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {type ReactNode, useState} from 'react'
import {Button} from '../ui/button'
import {Dialog, DialogContent, DialogTitle} from '../ui/dialog'

interface Props {
  /** Заголовок для screen reader и шапки Dialog */
  title: string
  /** Левая панель (Input) */
  left: ReactNode
  /** Правая панель (Output) */
  right: ReactNode
  /** Высота обычного режима, по умолчанию h-[560px] */
  normalHeight?: string
  /** Показывать кнопку «развернуть» рядом с панелями */
  showButton?: boolean
}

export function ExpandableSplit({
  title,
  left,
  right,
  normalHeight = 'h-[560px]',
  showButton = true,
}: Props) {
  const t = useTranslations('global')
  const [open, setOpen] = useState(false)

  // Оборачиваем панели в div фиксированной высоты, чтобы они одинаково
  // рендерились и в обычном режиме, и в Dialog.
  const pair = (heightClass: string) => (
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${heightClass}`}>
      <div className="min-h-0 overflow-hidden">{left}</div>
      <div className="min-h-0 overflow-hidden">{right}</div>
    </div>
  )

  return (
    <>
      {showButton && (
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="h-8 gap-1.5 px-2.5 text-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            {t('expand')}
          </Button>
        </div>
      )}

      {pair(normalHeight)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="fullscreen"
          showCloseButton={false}
          className="flex h-[95vh] max-h-[95vh] w-[95vw] max-w-[95vw] flex-col gap-0 p-0"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>

          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
              {title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label={t('collapse')}
              className="h-6 w-6"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden p-4">{pair('h-full')}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
