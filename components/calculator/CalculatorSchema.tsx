import {getLocale, getTranslations} from 'next-intl/server'
import type {CalculatorConfig} from '@/types'
import {HowToUseStep} from '../shared/HowToUseSection'

interface Props {
  calc: CalculatorConfig
  url: string
}

const PUBLISHER = {
  '@type': 'Organization',
  name: 'ProjectName',
} as const

export async function CalculatorSchema({calc, url}: Props) {
  const t = await getTranslations('config')
  const locale = await getLocale()

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t(calc.h1),
    description: t(calc.description),
    url,
    inLanguage: locale,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: PUBLISHER,
  }

  const faq =
    calc.faq && calc.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: calc.faq.map(item => ({
            '@type': 'Question',
            name: t(item.q),
            acceptedAnswer: {'@type': 'Answer', text: t(item.a)},
          })),
        }
      : null

  const howToTitleKey = `${calc.slug}.howToUseTitle`
  const howToItemsKey = `${calc.slug}.howToUse`
  const hasHowTo = t.has(howToTitleKey) && t.has(howToItemsKey)
  const howToSteps = hasHowTo ? (t.raw(howToItemsKey) as HowToUseStep[]) : []

  const howTo =
    hasHowTo && Array.isArray(howToSteps) && howToSteps.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: t(howToTitleKey),
          step: howToSteps.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.title,
            text: s.description,
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD
        dangerouslySetInnerHTML={{__html: JSON.stringify(webApp)}}
      />
      {faq && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD
          dangerouslySetInnerHTML={{__html: JSON.stringify(faq)}}
        />
      )}
      {howTo && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD
          dangerouslySetInnerHTML={{__html: JSON.stringify(howTo)}}
        />
      )}
    </>
  )
}
