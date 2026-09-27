import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about')

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: '/about',
      languages: {
        en: '/about',
        ru: '/ru/about',
      },
    },
  }
}

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>

      <div className="prose prose-gray mt-6 max-w-none">
        <p>{t('intro')}</p>
        <h2 className="mt-8 text-xl font-semibold">{t('whyTitle')}</h2>
        <p>{t('whyText')}</p>
        <h2 className="mt-8 text-xl font-semibold">{t('privacyTitle')}</h2>
        <p>{t('privacyText')}</p>
        <h2 className="mt-8 text-xl font-semibold">{t('contactTitle')}</h2>
        <p>
          {t('contactText')}{' '}
          <a
            href="mailto:hello@example.com"
            className="text-blue-600 hover:underline"
          >
            hello@example.com
          </a>
        </p>
      </div>
    </article>
  )
}
