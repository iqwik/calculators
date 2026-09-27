'use client'

import {useTranslations} from 'next-intl'
import {SearchTrigger} from '@/components/search/SearchTrigger'
import {categories} from '@/data'
import {Link, usePathname} from '@/i18n/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '../ui/sidebar'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip'
import {SidebarSettings} from './SidebarSettings'

export function AppSidebar() {
  const t = useTranslations('sidebar')
  const tHome = useTranslations('home')
  const pathname = usePathname()
  const {state} = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-27 gap-2 p-2">
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
          <Link
            href="/"
            className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold group-data-[collapsible=icon]:hidden"
          >
            <span className="text-lg">{'/'}</span>
            <span className="truncate">{'ProjectName'}</span>
          </Link>
          <Tooltip>
            <TooltipTrigger render={<SidebarTrigger className="size-9" />} />
            <TooltipContent side="right">
              {state === 'expanded' ? t('toggle.collapse') : t('toggle.expand')}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="h-9 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
          <div className="group-data-[collapsible=icon]:hidden">
            <SearchTrigger variant="full" />
          </div>
          <div className="hidden group-data-[collapsible=icon]:block">
            <SearchTrigger variant="icon" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {categories.map(cat => {
              const href = `/${cat.slug}`
              const isActive = pathname === href
              return (
                <SidebarMenuItem key={cat.slug}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={tHome(`categories.${cat.slug}`)}
                    render={<Link href={href} />}
                  >
                    <span aria-hidden="true">{cat.icon}</span>
                    <span>{tHome(`categories.${cat.slug}`)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSettings />
      </SidebarFooter>
    </Sidebar>
  )
}
