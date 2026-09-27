import {getTranslations} from 'next-intl/server'
import {getBaseUrl} from '@/helpers'
import type {ToolConfig} from '@/types'

interface Props {
  tool: ToolConfig
  url: string
}

export async function ToolSchema({tool, url}: Props) {
  const t = await getTranslations('config')

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t(tool.h1),
    url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'},
    description: t(tool.description),
    publisher: {
      '@type': 'Organization',
      name: 'ProjectName',
      url: getBaseUrl(),
    },
  }

  const faq =
    tool.faq && tool.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: tool.faq.map(item => ({
            '@type': 'Question',
            name: t(item.q),
            acceptedAnswer: {'@type': 'Answer', text: t(item.a)},
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
    </>
  )
}
