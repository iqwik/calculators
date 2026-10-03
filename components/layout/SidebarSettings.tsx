'use client'

import {SettingsIcon} from '@animateicons/react/lucide'
import {useTranslations} from 'next-intl'
import {Link} from '@/i18n/navigation'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover'
import {Separator} from '../ui/separator'
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from '../ui/sidebar'
import {LocaleSwitcher} from './LocaleSwitcher'
import {ThemeToggle} from './ThemeToggle'

export function SidebarSettings() {
  const t = useTranslations('sidebar.settings')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger
            render={
              <SidebarMenuButton
                className="cursor-pointer gap-1 text-sm"
                tooltip={t('label')}
              />
            }
          >
            <SettingsIcon className="size-5" />
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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
