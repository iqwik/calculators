import type {CalculatorConfig} from '@/types'

export const datetimeCalculators: CalculatorConfig[] = [
  {
    slug: 'age-calculator',
    category: 'datetime',
    title: 'age-calculator.title',
    h1: 'age-calculator.h1',
    description: 'age-calculator.description',
    keywords: ['age-calculator.keywords'],
    inputs: [
      {
        name: 'birthDate',
        label: 'age-calculator.inputs.birthDate',
        type: 'date',
      },
      {
        name: 'targetDate',
        label: 'age-calculator.inputs.targetDate',
        type: 'date',
        hint: 'age-calculator.hints.targetDate',
      },
    ],
    calculate: ({birthDate, targetDate}) => {
      const birth = new Date(String(birthDate))
      const target = targetDate ? new Date(String(targetDate)) : new Date()

      let years = target.getFullYear() - birth.getFullYear()
      let months = target.getMonth() - birth.getMonth()
      let days = target.getDate() - birth.getDate()

      if (days < 0) {
        months--
        const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0)
        days += prevMonth.getDate()
      }
      if (months < 0) {
        years--
        months += 12
      }

      const totalDays = Math.floor(
        (target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24),
      )

      return {
        value: `${years} / ${months} / ${days}`,
        secondary: [
          {
            label: 'age-calculator.secondary.years',
            value: String(years),
          },
          {
            label: 'age-calculator.secondary.months',
            value: String(months),
          },
          {
            label: 'age-calculator.secondary.days',
            value: String(days),
          },
          {
            label: 'age-calculator.secondary.totalDays',
            value: totalDays.toLocaleString('en-US'),
          },
          {
            label: 'age-calculator.secondary.totalWeeks',
            value: Math.floor(totalDays / 7).toLocaleString('en-US'),
          },
        ],
      }
    },
    resultLabel: 'age-calculator.resultLabel',
    faq: [
      {q: 'age-calculator.faq.q1', a: 'age-calculator.faq.a1'},
      {q: 'age-calculator.faq.q2', a: 'age-calculator.faq.a2'},
    ],
    publishedAt: '2024-01-15',
  },
]
