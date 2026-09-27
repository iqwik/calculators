import {getLocale, getTranslations} from 'next-intl/server'
import type {CalculatorConfig} from '@/types'

interface Props {
  calc: CalculatorConfig
  url: string
}

export async function CalculatorSchema({calc, url}: Props) {
  const t = await getTranslations('config')
  const locale = await getLocale()

  const schema = {
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
  }

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe here
      dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
    />
  )
}
