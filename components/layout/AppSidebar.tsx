'use client'

import {cn} from 'cn'
import {ChevronRight} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useMemo, useState} from 'react'
import {SearchTrigger} from '@/components/search/SearchTrigger'
import {getAllCategories} from '@/data'
import {Link, usePathname} from '@/i18n/navigation'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from '../ui/sidebar'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip'
import {SidebarSettings} from './SidebarSettings'

export function AppSidebar() {
  const tSidebar = useTranslations('sidebar')
  const tConfig = useTranslations('config')
  const tHome = useTranslations('home')
  const pathname = usePathname()

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  // biome-ignore lint/correctness/useExhaustiveDependencies: for auto open collapsed category if pathame was changed
  useEffect(() => {
    setOpenMap({})
  }, [pathname])

  const {state} = useSidebar()
  const [isAnimating, setIsAnimating] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: block tooltips during sidebar animation
  useEffect(() => {
    setIsAnimating(true)
    const t = setTimeout(() => setIsAnimating(false), 350)
    return () => clearTimeout(t)
  }, [state])

  const isSidebarExpanded = state === 'expanded'
  const categories = useMemo(() => getAllCategories(), [])

  const [showPill, setShowPill] = useState(false)

  useEffect(() => {
    if (isSidebarExpanded) {
      setShowPill(false)
      return
    }
    const t = setTimeout(() => setShowPill(true), 200)
    return () => clearTimeout(t)
  }, [isSidebarExpanded])

  return (
    <>
      <Sidebar
        collapsible="offcanvas"
        className="data-[state=collapsed]:pointer-none"
      >
        <SidebarHeader className="p-2">
          <div
            className={cn(
              'flex items-center gap-2',
              isAnimating && 'pointer-events-none',
            )}
          >
            <Link
              href="/"
              className="flex min-w-0 flex-1 items-center gap-1 rounded-md px-2 text-sm font-semibold"
            >
              <span className="text-lg shrink-0">{'/'}</span>
              <span className="truncate">{'ProjectName'}</span>
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              <SearchTrigger
                tooltip
                variant="icon"
                buttonClassName="text-muted-foreground hover:text-muted-foreground transition-colors duration-300"
              />
              <Tooltip>
                <TooltipTrigger
                  render={props => (
                    <span {...props} className="inline-flex shrink-0" />
                  )}
                >
                  <SidebarTrigger className="size-8 shrink-0 text-muted-foreground hover:text-muted-foreground transition-colors duration-300" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {tSidebar('toggle.collapse')}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-y-auto">
          <SidebarGroup>
            <SidebarMenu>
              {categories.map(cat => {
                const href = `/${cat.slug}`
                const isActive = pathname === href

                const hasActiveChild =
                  cat.tools.filter(tool => `/${tool.slug}` === pathname)
                    ?.length > 0

                const isOpen =
                  openMap[cat.slug] ?? !!(hasActiveChild && !isActive)

                return (
                  <Collapsible
                    key={cat.slug}
                    open={isOpen}
                    onOpenChange={isOpen =>
                      setOpenMap(prev => ({...prev, [cat.slug]: isOpen}))
                    }
                    className="group/collapsible"
                  >
                    <SidebarMenuItem className="flex-col gap-1.5">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={tHome(`categories.${cat.slug}`)}
                        className="group/item shrink-0 gap-0"
                        render={<CollapsibleTrigger />}
                      >
                        <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
                        <div className="flex flex-1 overflow-hidden items-center group-data-[collapsible=icon]:opacity-20">
                          <span
                            className={cn(
                              'flex-1 wrap-anywhere text-sm ml-2 font-semibold',
                              'group-data-[collapsible=icon]:truncate',
                            )}
                          >
                            {tHome(`categories.${cat.slug}`)}
                          </span>
                          <span
                            className={cn(
                              'font-tag bg-muted text-muted-foreground size-4.5 p-0.5 rounded-sm flex justify-center items-center text-[11px] truncate',
                              isActive &&
                                'text-muted-foreground bg-secondary-hover',
                            )}
                          >
                            {cat.tools.length}
                          </span>
                        </div>
                      </SidebarMenuButton>
                      <CollapsibleContent>
                        <SidebarMenuSub className="pr-0 mr-0! gap-y-1.5">
                          {cat.tools.map(tool => {
                            const toolHref = `/${tool.slug}`
                            const isToolActive = pathname === toolHref
                            return (
                              <SidebarMenuSubItem key={tool.slug}>
                                <SidebarMenuSubButton
                                  isActive={isToolActive}
                                  render={<Link href={toolHref} />}
                                >
                                  <tool.Icon className="size-4" />
                                  <div className="flex flex-1 overflow-hidden items-center">
                                    <span className="text-[13px] leading-3.5 wrap-anywhere">
                                      {tConfig(`${tool.slug}.h1`)}
                                    </span>
                                  </div>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSettings />
        </SidebarFooter>
      </Sidebar>
      {showPill && (
        <div className="fixed top-1.25 left-3.75 z-50 gap-2 items-center hidden sm:flex">
          <span className="text-lg shrink-0">{'/'}</span>
          <div className="flex items-center gap-0.5 rounded-lg border bg-background px-1 py-0.5 shadow-md">
            <Tooltip>
              <TooltipTrigger
                render={props => (
                  <span {...props} className="inline-flex shrink-0" />
                )}
              >
                <SidebarTrigger className="size-8 shrink-0 hover:bg-secondary text-muted-foreground hover:text-muted-foreground transition-colors duration-300" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {tSidebar('toggle.expand')}
              </TooltipContent>
            </Tooltip>
            <SearchTrigger
              tooltip
              variant="icon"
              buttonClassName="hover:bg-secondary text-muted-foreground hover:text-muted-foreground transition-colors duration-300"
            />
          </div>
        </div>
      )}
    </>
  )
}
