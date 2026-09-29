'use client'

import {Maximize2, Minimize2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {type ReactNode, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog'

interface Props {
  /** Заголовок для Dialog (sr-only) */
  title: string
  /** Содержимое панели (то же, что в обычном режиме) */
  children: ReactNode
  /** Рендер кнопки для разворачивания */
  renderTrigger?: () => ReactNode
}

export function FullscreenButton({title, children}: Props) {
  const t = useTranslations('global')
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={t('fullscreen')}
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
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
              aria-label={t('exitFullscreen')}
              className="h-6 w-6"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
