import {getTranslations} from 'next-intl/server'
import {getBaseUrl} from '@/helpers'
import type {CalculatorConfig} from '@/types/calculator'

const BASE_URL = getBaseUrl()

interface CalculatorSchemaProps {
  config: CalculatorConfig
}

export async function CalculatorSchema({config}: CalculatorSchemaProps) {
  const t = await getTranslations('config')
  const tSchema = await getTranslations('schema')
  const url = `${BASE_URL}/${config.category}/${config.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t(config.h1),
    description: t(config.description),
    url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: tSchema('priceCurrency'),
    },
    inLanguage: tSchema('inLanguage'),
  }

  const faqSchema =
    config.faq && config.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: config.faq.map(item => ({
            '@type': 'Question',
            name: t(item.q),
            acceptedAnswer: {
              '@type': 'Answer',
              text: t(item.a),
            },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD требует dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD требует dangerouslySetInnerHTML
          dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
        />
      )}
    </>
  )
}
