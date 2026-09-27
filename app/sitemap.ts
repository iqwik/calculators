import type {MetadataRoute} from 'next'
import {categories, getAllCalculators} from '@/data'
import {getBaseUrl} from '@/helpers'

const BASE_URL = getBaseUrl()

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const home = {
    url: BASE_URL,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 1,
  }

  const categoryPages = categories.map(cat => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const calculatorPages = getAllCalculators().map(calc => ({
    url: `${BASE_URL}/${calc.category}/${calc.slug}`,
    lastModified: calc.publishedAt ? new Date(calc.publishedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const staticPages = [
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  return [home, ...categoryPages, ...calculatorPages, ...staticPages]
}
