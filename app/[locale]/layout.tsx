import type {Metadata} from 'next'
import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import {ReactNode} from 'react'
import {AppSidebar} from '@/components/layout/AppSidebar'
import {ThemeProvider} from '@/components/providers/theme-provider'
import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar'
import {getBaseUrl} from '@/helpers'
import '../globals.css'

import {Geist_Mono, Inter} from 'next/font/google'
import {SearchTrigger} from '@/components/search/SearchTrigger'

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
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                  <SidebarTrigger />
                  <div className="flex-1 flex justify-center">
                    <SearchTrigger />
                  </div>
                </header>
                {children}
              </main>
            </SidebarProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
