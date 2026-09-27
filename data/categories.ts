import type {CategorySlug} from '@/types'

export interface Category {
  slug: CategorySlug
  icon: string
}

export const categories: Category[] = [
  {slug: 'finance', icon: '💰'},
  {slug: 'health', icon: '❤️'},
  {slug: 'text', icon: '✍️'},
  {slug: 'developer', icon: '{ }'},
  {slug: 'generators', icon: '⚡'},
  {slug: 'business', icon: '📄'},
]
