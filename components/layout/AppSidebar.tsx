'use client'

import {useTranslations} from 'next-intl'
import {categories} from '@/data'
import {Link, usePathname} from '@/i18n/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar'
import {SidebarSettings} from './SidebarSettings'

export function AppSidebar() {
  const t = useTranslations('sidebar')
  const tHome = useTranslations('home')
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2 p-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold"
        >
          <span className="text-lg">{'/'}</span>
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {'ProjectName'}
          </span>
        </Link>
        {/* <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('search.placeholder')}
            aria-label={t('search.label')}
            className="h-8 pl-8 text-sm"
          />
        </div> */}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('categories.title')}</SidebarGroupLabel>
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
                    {/* <span aria-hidden="true">
                      <CategoryIcon slug={cat.slug} className="h-4 w-4" />
                    </span> */}
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
