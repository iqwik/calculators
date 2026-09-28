import type {Metadata} from 'next'
import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import {ReactNode} from 'react'
import {AppSidebar} from '@/components/layout/AppSidebar'
import {ThemeProvider} from '@/components/providers/theme-provider'
import {SearchTrigger} from '@/components/search/SearchTrigger'
import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar'
import {getBaseUrl} from '@/helpers'
import {routing} from '@/i18n/routing'
import '../globals.css'

import {Geist_Mono, Inter} from 'next/font/google'
import {cookies} from 'next/headers'
import {SearchProvider} from '@/components/search/SearchProvider'
import {TooltipProvider} from '@/components/ui/tooltip'

export function generateStaticParams() {
  return routing.locales.map(locale => ({locale}))
}

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'ProjectName',
    template: '%s | ProjectName',
  },
  description: 'Free, fast, privacy-first online tools.',
}

interface LayoutProps {
  children: ReactNode
  params: Promise<{locale: string}>
}

export default async function LocaleLayout({children, params}: LayoutProps) {
  const {locale} = await params
  const messages = await getMessages()

  const cookieStore = await cookies()
  const sidebarState = cookieStore.get('sidebar_state')?.value
  const defaultOpen = sidebarState !== 'false'

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <TooltipProvider>
              <SearchProvider>
                <SidebarProvider defaultOpen={defaultOpen}>
                  <AppSidebar />
                  <main className="flex-1 overflow-y-auto">
                    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4 lg:hidden">
                      <SidebarTrigger />
                      <div className="flex flex-1 justify-end">
                        <SearchTrigger variant="icon" />
                      </div>
                    </header>
                    {children}
                  </main>
                </SidebarProvider>
              </SearchProvider>
            </TooltipProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
