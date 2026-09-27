import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {locale as getRootLocale} from 'next/root-params'
import {hasLocale, NextIntlClientProvider} from 'next-intl'
import {getMessages, getTranslations} from 'next-intl/server'
import type {PropsWithChildren} from 'react'
import {categories} from '@/data'
import {getBaseUrl} from '@/helpers'
import {Link} from '@/i18n/navigation'
import {routing} from '@/i18n/routing'
import '../globals.css'

const BASE_URL = getBaseUrl()

export function generateStaticParams() {
  return routing.locales.map(locale => ({locale}))
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRootLocale()
  const t = await getTranslations({locale, namespace: 'meta'})

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t('homeTitle'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('homeDescription'),
    alternates: {
      languages: {
        en: `${BASE_URL}/`,
        ru: `${BASE_URL}/ru`,
      },
    },
  }
}

export default async function LocaleLayout({children}: PropsWithChildren) {
  const locale = await getRootLocale()
  if (!hasLocale(routing.locales, locale)) notFound()

  const messages = await getMessages()
  const t = await getTranslations('nav')

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <header className="border-b border-gray-200 bg-white">
            <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                🧮 {t('siteName')}
              </Link>
              <nav className="hidden gap-4 sm:flex">
                {categories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/${cat.slug}`}
                    className="text-sm text-gray-600 transition hover:text-blue-600"
                  >
                    {t(cat.slug)}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-gray-200 bg-white">
            <div className="container mx-auto max-w-5xl px-4 py-6 text-sm text-gray-500">
              <div className="flex flex-wrap gap-4">
                <Link href="/about" className="hover:text-blue-600">
                  {t('about')}
                </Link>
                <Link href="/privacy" className="hover:text-blue-600">
                  {t('privacy')}
                </Link>
              </div>
              <p className="mt-3">
                © {new Date().getFullYear()} {t('siteName')}
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
