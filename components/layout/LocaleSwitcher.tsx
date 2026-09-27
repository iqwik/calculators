'use client'

import {Globe} from 'lucide-react'
import {useLocale, useTranslations} from 'next-intl'
import {usePathname, useRouter} from '@/i18n/navigation'
import {routing} from '@/i18n/routing'
import {Button} from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('sidebar.settings')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
          />
        }
      >
        <Globe className="h-4 w-4" />
        <span>{t('language')}</span>
        <span className="ml-auto text-xs text-muted-foreground uppercase">
          {locale}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {routing.locales.map(l => (
          <DropdownMenuItem
            key={l}
            onClick={() => router.replace(pathname, {locale: l})}
          >
            {l.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
