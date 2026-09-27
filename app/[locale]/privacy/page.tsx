import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('privacy')

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: '/privacy',
      languages: {
        en: '/privacy',
        ru: '/ru/privacy',
      },
    },
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy')
  const updated = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {t('lastUpdated', {date: updated})}
      </p>

      <div className="prose prose-gray mt-6 max-w-none">
        <h2 className="mt-8 text-xl font-semibold">{t('s1Title')}</h2>
        <p>{t('s1Text')}</p>

        <h2 className="mt-8 text-xl font-semibold">{t('s2Title')}</h2>
        <p>{t('s2Text')}</p>

        <h2 className="mt-8 text-xl font-semibold">{t('s3Title')}</h2>
        <p>{t('s3Text')}</p>

        <h2 className="mt-8 text-xl font-semibold">{t('s4Title')}</h2>
        <p>
          {t('s4Text')}{' '}
          <a
            href="https://adssettings.google.com"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            adssettings.google.com
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold">{t('s5Title')}</h2>
        <p>
          {t('s5Text')}{' '}
          <a
            href="mailto:hello@example.com"
            className="text-blue-600 hover:underline"
          >
            hello@example.com
          </a>
          .
        </p>
      </div>
    </article>
  )
}
