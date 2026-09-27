import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('privacy.meta')
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy')

  const sections = [
    'data',
    'storage',
    'analytics',
    'thirdparty',
    'changes',
    'contact',
  ] as const

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        {t('updated', {date: '2026-09-27'})}
      </p>

      <p className="mt-6 text-lg text-muted-foreground">{t('intro')}</p>

      <div className="mt-12 space-y-10">
        {sections.map(key => (
          <section key={key}>
            <h2 className="text-xl font-semibold">
              {t(`sections.${key}.title`)}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t(`sections.${key}.text`)}
            </p>
          </section>
        ))}
      </div>
    </article>
  )
}
