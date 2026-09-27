import type {CalculatorConfig} from '@/types'

export const healthCalculators: CalculatorConfig[] = [
  {
    slug: 'bmi-calculator',
    category: 'health',
    title: 'bmi-calculator.title',
    h1: 'bmi-calculator.h1',
    description: 'bmi-calculator.description',
    keywords: ['bmi-calculator.keywords'],
    inputs: [
      {
        name: 'height',
        label: 'bmi-calculator.inputs.height',
        type: 'number',
        unit: 'cm',
        min: 100,
        max: 250,
        placeholder: '175',
      },
      {
        name: 'weight',
        label: 'bmi-calculator.inputs.weight',
        type: 'number',
        unit: 'kg',
        min: 20,
        max: 300,
        placeholder: '70',
      },
    ],
    calculate: ({height, weight}) => {
      const h = Number(height) / 100
      const w = Number(weight)
      const bmi = w / (h * h)
      return {
        value: Math.round(bmi * 10) / 10,
        raw: bmi,
      }
    },
    resultLabel: 'bmi-calculator.resultLabel',
    resultUnit: 'bmi-calculator.resultUnit',
    ranges: [
      {max: 18.5, label: 'bmi-calculator.ranges.underweight', color: 'blue'},
      {max: 25, label: 'bmi-calculator.ranges.normal', color: 'green'},
      {max: 30, label: 'bmi-calculator.ranges.overweight', color: 'orange'},
      {max: Infinity, label: 'bmi-calculator.ranges.obese', color: 'red'},
    ],
    faq: [
      {q: 'bmi-calculator.faq.q1', a: 'bmi-calculator.faq.a1'},
      {q: 'bmi-calculator.faq.q2', a: 'bmi-calculator.faq.a2'},
      {q: 'bmi-calculator.faq.q3', a: 'bmi-calculator.faq.a3'},
    ],
    related: ['calorie-calculator'],
    publishedAt: '2024-01-15',
  },
  {
    slug: 'calorie-calculator',
    category: 'health',
    title: 'calorie-calculator.title',
    h1: 'calorie-calculator.h1',
    description: 'calorie-calculator.description',
    keywords: ['calorie-calculator.keywords'],
    inputs: [
      {
        name: 'age',
        label: 'calorie-calculator.inputs.age',
        type: 'number',
        unit: 'years',
        min: 14,
        max: 100,
        placeholder: '30',
      },
      {
        name: 'gender',
        label: 'calorie-calculator.inputs.gender',
        type: 'select',
        options: [
          {value: 'male', label: 'calorie-calculator.options.male'},
          {value: 'female', label: 'calorie-calculator.options.female'},
        ],
        defaultValue: 'male',
      },
      {
        name: 'height',
        label: 'calorie-calculator.inputs.height',
        type: 'number',
        unit: 'cm',
        min: 100,
        max: 250,
        placeholder: '175',
      },
      {
        name: 'weight',
        label: 'calorie-calculator.inputs.weight',
        type: 'number',
        unit: 'kg',
        min: 30,
        max: 300,
        placeholder: '70',
      },
      {
        name: 'activity',
        label: 'calorie-calculator.inputs.activity',
        type: 'select',
        options: [
          {value: '1.2', label: 'calorie-calculator.options.sedentary'},
          {value: '1.375', label: 'calorie-calculator.options.light'},
          {value: '1.55', label: 'calorie-calculator.options.moderate'},
          {value: '1.725', label: 'calorie-calculator.options.high'},
          {value: '1.9', label: 'calorie-calculator.options.veryHigh'},
        ],
        defaultValue: '1.375',
      },
    ],
    calculate: ({age, gender, height, weight, activity}) => {
      const a = Number(age)
      const h = Number(height)
      const w = Number(weight)
      const act = Number(activity)

      const bmr =
        gender === 'male'
          ? 10 * w + 6.25 * h - 5 * a + 5
          : 10 * w + 6.25 * h - 5 * a - 161

      const tdee = Math.round(bmr * act)

      return {
        value: tdee,
        secondary: [
          {
            label: 'calorie-calculator.secondary.bmr',
            value: `${Math.round(bmr)} kcal`,
          },
          {
            label: 'calorie-calculator.secondary.loss',
            value: `${Math.round(tdee * 0.8)} kcal`,
          },
          {
            label: 'calorie-calculator.secondary.gain',
            value: `${Math.round(tdee * 1.15)} kcal`,
          },
        ],
      }
    },
    resultLabel: 'calorie-calculator.resultLabel',
    resultUnit: 'calorie-calculator.resultUnit',
    faq: [
      {q: 'calorie-calculator.faq.q1', a: 'calorie-calculator.faq.a1'},
      {q: 'calorie-calculator.faq.q2', a: 'calorie-calculator.faq.a2'},
    ],
    related: ['bmi-calculator'],
    publishedAt: '2024-01-15',
  },
  {
    slug: 'age-calculator',
    category: 'health',
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
