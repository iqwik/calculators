import type {MetadataRoute} from 'next'
import {categories, getAllCalculators} from '@/data'
import {getBaseUrl} from '@/helpers'
import {routing} from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()
  const now = new Date()
  const staticPages = ['', '/about', '/privacy']
  const urls: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`

    for (const path of staticPages) {
      urls.push({
        url: `${baseUrl}${prefix}${path}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: path === '' ? 1 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(l => [
              l,
              `${baseUrl}${l === routing.defaultLocale ? '' : `/${l}`}${path}`,
            ]),
          ),
        },
      })
    }

    for (const cat of categories) {
      urls.push({
        url: `${baseUrl}${prefix}/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(l => [
              l,
              `${baseUrl}${l === routing.defaultLocale ? '' : `/${l}`}/${cat.slug}`,
            ]),
          ),
        },
      })
    }

    for (const calc of getAllCalculators()) {
      urls.push({
        url: `${baseUrl}${prefix}/${calc.slug}`,
        lastModified: calc.publishedAt ? new Date(calc.publishedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.75,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(l => [
              l,
              `${baseUrl}${l === routing.defaultLocale ? '' : `/${l}`}/${calc.slug}`,
            ]),
          ),
        },
      })
    }
  }

  return urls
}
