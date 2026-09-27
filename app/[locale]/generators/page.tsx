import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'
import {CategoryPage} from '@/components/category/CategoryPage'
import {CategorySlug} from '@/types'

const CATEGORY: CategorySlug = 'generators'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home')
  return {
    title: t(`categories.${CATEGORY}`),
  }
}
export default function Page() {
  return <CategoryPage category={CATEGORY} />
}
