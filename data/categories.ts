import type {CategorySlug} from '@/types'

export interface Category {
  slug: CategorySlug
  title: string
  description: string
  icon: string
}

export const categories: Category[] = [
  {
    slug: 'health',
    title: 'Здоровье',
    description:
      'Калькуляторы ИМТ, калорий, пульса и другие инструменты для здоровья',
    icon: '❤️',
  },
  {
    slug: 'finance',
    title: 'Финансы',
    description: 'Ипотека, кредиты, проценты, налоги — финансовые калькуляторы',
    icon: '💰',
  },
  {
    slug: 'math',
    title: 'Математика',
    description:
      'Проценты, дроби, площади, объёмы — математические калькуляторы',
    icon: '📐',
  },
  {
    slug: 'datetime',
    title: 'Дата и время',
    description: 'Калькулятор возраста, разница дат, день недели',
    icon: '📅',
  },
]
