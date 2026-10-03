'use client'

import {cn} from 'cn'
import {ChevronRight} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {
  ComponentType,
  HTMLAttributes,
  RefAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {SearchTrigger} from '@/components/search/SearchTrigger'
import {getAllCategories} from '@/data'
import {Link, usePathname} from '@/i18n/navigation'
import {IconHandle} from '@/types'
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
              'flex items-center',
              isAnimating && 'pointer-events-none',
            )}
          >
            <Link
              href="/"
              className="flex min-w-0 flex-1 items-center gap-1 rounded-md px-2 font-semibold"
            >
              <span className="text-lg shrink-0">{'/'}</span>
              <span className="truncate">{'ProjectName'}</span>
            </Link>

            <div className="flex items-center gap-0.5">
              <SearchTrigger
                tooltip
                variant="icon"
                buttonClassName="text-muted-foreground hover:text-muted-foreground transition-colors duration-300"
              />
              <Tooltip>
                <TooltipTrigger render={props => <span {...props} />}>
                  <SidebarTrigger variant="close" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {tSidebar('toggle.collapse')}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="scrollbar-gutter-stable overflow-y-scroll">
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
                        className="group/item"
                        render={
                          <CollapsibleTrigger className="cursor-pointer" />
                        }
                      >
                        <ChevronRight className="ml-auto size-3 transition-transform duration-250 animate-out group-data-open/collapsible:rotate-90" />
                        <div className="flex flex-1 h-full gap-1.5 overflow-hidden items-center group-data-[collapsible=icon]:opacity-20">
                          <span
                            className={cn(
                              'flex-1 wrap-anywhere text-sm leading-4.5 ml-1 font-semibold',
                              'group-data-[collapsible=icon]:truncate',
                            )}
                          >
                            {tHome(`categories.${cat.slug}`)}
                          </span>
                          <div
                            className={cn(
                              'font-tag bg-muted text-muted-foreground size-5 rounded-sm flex justify-center items-center text-[10px] truncate',
                              isActive &&
                                'text-muted-foreground bg-secondary-hover',
                            )}
                          >
                            {cat.tools.length}
                          </div>
                        </div>
                      </SidebarMenuButton>
                      <CollapsibleContent>
                        <SidebarMenuSub className="pr-0 mr-0! gap-y-1.5">
                          {cat.tools.map(tool => (
                            <SidebarMenuLinkWithAnimatedIcon
                              key={tool.slug}
                              slug={tool.slug}
                              Icon={tool.Icon}
                            />
                          ))}
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
              <TooltipTrigger render={props => <div {...props} />}>
                <SidebarTrigger variant="open" />
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

interface IconProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'color'
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
  > {
  size?: number
  duration?: number
  isAnimated?: boolean
  color?: string
}

function SidebarMenuLinkWithAnimatedIcon({
  slug,
  Icon,
}: {
  slug: string
  Icon: ComponentType<IconProps & RefAttributes<IconHandle>>
}) {
  const tConfig = useTranslations('config')
  const pathname = usePathname()
  const toolHref = `/${slug}`
  const isActive = pathname === toolHref
  const iconRef = useRef<IconHandle>(null)

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={isActive}
        render={<Link href={toolHref} />}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
      >
        <Icon ref={iconRef} isAnimated={false} className="size-4" />
        <div className="flex flex-1 overflow-hidden items-center">
          <span className="text-sm leading-4 wrap-anywhere">
            {tConfig(`${slug}.h1`)}
          </span>
        </div>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}
