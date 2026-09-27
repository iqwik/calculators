'use client'

import {Settings} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {Link} from '@/i18n/navigation'
import {Button} from '../ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover'
import {Separator} from '../ui/separator'
import {LocaleSwitcher} from './LocaleSwitcher'
import {ThemeToggle} from './ThemeToggle'

export function SidebarSettings() {
  const t = useTranslations('sidebar.settings')

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
          />
        }
      >
        <Settings className="h-4 w-4" />
        <span>{t('label')}</span>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-56 p-2">
        <div className="flex flex-col gap-1">
          <Link
            href="/about"
            className="rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            {t('about')}
          </Link>
          <Link
            href="/privacy"
            className="rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            {t('privacy')}
          </Link>
          <Separator className="my-2" />
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </PopoverContent>
    </Popover>
  )
}
