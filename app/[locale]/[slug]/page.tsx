import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {CalcLayout} from '@/components/calculator/CalcLayout'
import {ToolLayout} from '@/components/tool/ToolLayout'
import {getAllRegistryEntries, getRegistryEntry} from '@/data'
import {getBaseUrl} from '@/helpers'

interface PageProps {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  return getAllRegistryEntries().map(entry => ({slug: entry.config.slug}))
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug} = await params
  const entry = getRegistryEntry(slug)
  if (!entry) return {}

  const t = await getTranslations('config')
  const baseUrl = getBaseUrl()

  return {
    title: t(entry.config.title),
    description: t(entry.config.description),
    alternates: {
      canonical: `${baseUrl}/${entry.config.slug}`,
      languages: {
        en: `${baseUrl}/${entry.config.slug}`,
        ru: `${baseUrl}/ru/${entry.config.slug}`,
      },
    },
  }
}

export default async function Page({params}: PageProps) {
  const {slug} = await params
  const entry = getRegistryEntry(slug)
  if (!entry) notFound()

  if (entry.type === 'calculator') {
    return <CalcLayout config={entry.config} />
  }

  return <ToolLayout config={entry.config} />
}
