import type {CalculatorConfig} from '@/types'

export const healthCalculators: CalculatorConfig[] = [
  {
    slug: 'bmi-calculator',
    category: 'health',
    title: 'bmi-calculator.title',
    h1: 'bmi-calculator.h1',
    description: 'bmi-calculator.description',
    tags: ['health', 'calculator'],
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
    tags: ['health', 'calculator'],
    inputs: [
      {
        name: 'age',
        label: 'calorie-calculator.inputs.age',
        type: 'number',
        unit: 'calorie-calculator.units.years',
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
    tags: ['health', 'calculator'],
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
  {
    slug: 'tdee-macro-calculator',
    category: 'health',
    tags: ['calculator', 'health'],
    title: 'tdee-macro-calculator.title',
    h1: 'tdee-macro-calculator.h1',
    description: 'tdee-macro-calculator.description',
    keywords: ['tdee-macro-calculator.keywords'],
    inputs: [
      {
        name: 'age',
        label: 'tdee-macro-calculator.inputs.age',
        type: 'number',
        unit: 'tdee-macro-calculator.units.years',
        min: 14,
        max: 100,
        placeholder: '30',
        defaultValue: 30,
      },
      {
        name: 'gender',
        label: 'tdee-macro-calculator.inputs.gender',
        type: 'select',
        options: [
          {value: 'male', label: 'tdee-macro-calculator.options.male'},
          {value: 'female', label: 'tdee-macro-calculator.options.female'},
        ],
        defaultValue: 'male',
      },
      {
        name: 'height',
        label: 'tdee-macro-calculator.inputs.height',
        type: 'number',
        unit: 'cm',
        min: 100,
        max: 250,
        placeholder: '175',
        defaultValue: 175,
      },
      {
        name: 'weight',
        label: 'tdee-macro-calculator.inputs.weight',
        type: 'number',
        unit: 'kg',
        min: 30,
        max: 300,
        placeholder: '70',
        defaultValue: 70,
      },
      {
        name: 'activity',
        label: 'tdee-macro-calculator.inputs.activity',
        type: 'select',
        options: [
          {value: '1.2', label: 'tdee-macro-calculator.options.sedentary'},
          {value: '1.375', label: 'tdee-macro-calculator.options.light'},
          {value: '1.55', label: 'tdee-macro-calculator.options.moderate'},
          {value: '1.725', label: 'tdee-macro-calculator.options.high'},
          {value: '1.9', label: 'tdee-macro-calculator.options.veryHigh'},
        ],
        defaultValue: '1.375',
      },
      {
        name: 'goal',
        label: 'tdee-macro-calculator.inputs.goal',
        type: 'select',
        options: [
          {value: 'lose', label: 'tdee-macro-calculator.options.lose'},
          {value: 'maintain', label: 'tdee-macro-calculator.options.maintain'},
          {value: 'gain', label: 'tdee-macro-calculator.options.gain'},
        ],
        defaultValue: 'maintain',
      },
    ],
    calculate: ({age, gender, height, weight, activity, goal}) => {
      const a = Number(age)
      const h = Number(height)
      const w = Number(weight)
      const act = Number(activity)

      const bmr =
        gender === 'male'
          ? 10 * w + 6.25 * h - 5 * a + 5
          : 10 * w + 6.25 * h - 5 * a - 161

      const tdee = bmr * act

      let calories: number
      let proteinPct: number
      let carbsPct: number
      let fatPct: number

      if (goal === 'lose') {
        calories = tdee * 0.8
        proteinPct = 0.4
        carbsPct = 0.3
        fatPct = 0.3
      } else if (goal === 'gain') {
        calories = tdee * 1.15
        proteinPct = 0.25
        carbsPct = 0.45
        fatPct = 0.3
      } else {
        calories = tdee
        proteinPct = 0.3
        carbsPct = 0.4
        fatPct = 0.3
      }

      const protein = (calories * proteinPct) / 4
      const carbs = (calories * carbsPct) / 4
      const fat = (calories * fatPct) / 9

      return {
        value: Math.round(calories),
        raw: calories,
        secondary: [
          {
            label: 'tdee-macro-calculator.secondary.bmr',
            value: `${Math.round(bmr)} kcal`,
          },
          {
            label: 'tdee-macro-calculator.secondary.tdee',
            value: `${Math.round(tdee)} kcal`,
          },
          {
            label: 'tdee-macro-calculator.secondary.protein',
            value: `${Math.round(protein)} g`,
          },
          {
            label: 'tdee-macro-calculator.secondary.carbs',
            value: `${Math.round(carbs)} g`,
          },
          {
            label: 'tdee-macro-calculator.secondary.fat',
            value: `${Math.round(fat)} g`,
          },
        ],
      }
    },
    resultLabel: 'tdee-macro-calculator.resultLabel',
    resultUnit: 'tdee-macro-calculator.resultUnit',
    faq: [
      {q: 'tdee-macro-calculator.faq.q1', a: 'tdee-macro-calculator.faq.a1'},
      {q: 'tdee-macro-calculator.faq.q2', a: 'tdee-macro-calculator.faq.a2'},
      {q: 'tdee-macro-calculator.faq.q3', a: 'tdee-macro-calculator.faq.a3'},
      {q: 'tdee-macro-calculator.faq.q4', a: 'tdee-macro-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-18',
  },
  {
    slug: 'body-fat-calculator',
    category: 'health',
    tags: ['calculator', 'health'],
    title: 'body-fat-calculator.title',
    h1: 'body-fat-calculator.h1',
    description: 'body-fat-calculator.description',
    keywords: ['body-fat-calculator.keywords'],
    inputs: [
      {
        name: 'gender',
        label: 'body-fat-calculator.inputs.gender',
        type: 'select',
        options: [
          {value: 'male', label: 'body-fat-calculator.options.male'},
          {value: 'female', label: 'body-fat-calculator.options.female'},
        ],
        defaultValue: 'male',
      },
      {
        name: 'height',
        label: 'body-fat-calculator.inputs.height',
        type: 'number',
        unit: 'body-fat-calculator.units.cm',
        min: 100,
        max: 250,
        placeholder: '175',
        defaultValue: 175,
      },
      {
        name: 'weight',
        label: 'body-fat-calculator.inputs.weight',
        type: 'number',
        unit: 'kg',
        min: 30,
        max: 300,
        placeholder: '70',
        defaultValue: 70,
      },
      {
        name: 'neck',
        label: 'body-fat-calculator.inputs.neck',
        type: 'number',
        unit: 'body-fat-calculator.units.cm',
        min: 20,
        max: 80,
        step: 0.1,
        placeholder: '38',
        defaultValue: 38,
      },
      {
        name: 'waist',
        label: 'body-fat-calculator.inputs.waist',
        type: 'number',
        unit: 'body-fat-calculator.units.cm',
        min: 40,
        max: 200,
        step: 0.1,
        placeholder: '85',
        defaultValue: 85,
      },
      {
        name: 'hip',
        label: 'body-fat-calculator.inputs.hip',
        type: 'number',
        unit: 'body-fat-calculator.units.cm',
        min: 50,
        max: 200,
        step: 0.1,
        placeholder: '95',
        defaultValue: 95,
        hint: 'body-fat-calculator.hints.hip',
      },
    ],
    calculate: ({gender, height, weight, neck, waist, hip}) => {
      const h = Number(height)
      const w = Number(weight)
      const n = Number(neck)
      const wa = Number(waist)
      const hp = Number(hip)

      if (!Number.isFinite(h) || h <= 0) return {value: '—'}
      if (!Number.isFinite(n) || n <= 0) return {value: '—'}
      if (!Number.isFinite(wa) || wa <= 0) return {value: '—'}

      let bf: number

      if (gender === 'male') {
        if (wa - n <= 0) return {value: '—'}
        bf =
          495 /
            (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(h)) -
          450
      } else {
        if (!Number.isFinite(hp) || hp <= 0) return {value: '—'}
        if (wa + hp - n <= 0) return {value: '—'}
        bf =
          495 /
            (1.29579 -
              0.35004 * Math.log10(wa + hp - n) +
              0.221 * Math.log10(h)) -
          450
      }

      if (!Number.isFinite(bf) || bf < 0) return {value: '—'}

      const fatMass = (w * bf) / 100
      const leanMass = w - fatMass

      return {
        value: `${bf.toFixed(1)}%`,
        raw: bf,
        secondary: [
          {
            label: 'body-fat-calculator.secondary.fatMass',
            value: `${fatMass.toFixed(1)} kg`,
          },
          {
            label: 'body-fat-calculator.secondary.leanMass',
            value: `${leanMass.toFixed(1)} kg`,
          },
        ],
      }
    },
    resultLabel: 'body-fat-calculator.resultLabel',
    ranges: [
      {
        max: 6,
        label: 'body-fat-calculator.ranges.essential',
        color: 'blue',
      },
      {max: 14, label: 'body-fat-calculator.ranges.athletic', color: 'green'},
      {max: 18, label: 'body-fat-calculator.ranges.fitness', color: 'green'},
      {max: 25, label: 'body-fat-calculator.ranges.average', color: 'orange'},
      {max: Infinity, label: 'body-fat-calculator.ranges.obese', color: 'red'},
    ],
    faq: [
      {q: 'body-fat-calculator.faq.q1', a: 'body-fat-calculator.faq.a1'},
      {q: 'body-fat-calculator.faq.q2', a: 'body-fat-calculator.faq.a2'},
      {q: 'body-fat-calculator.faq.q3', a: 'body-fat-calculator.faq.a3'},
      {q: 'body-fat-calculator.faq.q4', a: 'body-fat-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-18',
  },
  {
    slug: 'ideal-weight-calculator',
    category: 'health',
    tags: ['calculator', 'health'],
    title: 'ideal-weight-calculator.title',
    h1: 'ideal-weight-calculator.h1',
    description: 'ideal-weight-calculator.description',
    keywords: ['ideal-weight-calculator.keywords'],
    inputs: [
      {
        name: 'gender',
        label: 'ideal-weight-calculator.inputs.gender',
        type: 'select',
        options: [
          {value: 'male', label: 'ideal-weight-calculator.options.male'},
          {value: 'female', label: 'ideal-weight-calculator.options.female'},
        ],
        defaultValue: 'male',
      },
      {
        name: 'height',
        label: 'ideal-weight-calculator.inputs.height',
        type: 'number',
        unit: 'ideal-weight-calculator.units.cm',
        min: 130,
        max: 220,
        step: 1,
        placeholder: '175',
        defaultValue: 175,
      },
    ],
    calculate: ({gender, height}) => {
      const h = Number(height)
      if (!Number.isFinite(h) || h < 100) return {value: '—'}

      const inches = h / 2.54
      const over60 = inches - 60
      const isMale = gender === 'male'

      const devine = isMale ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60
      const robinson = isMale ? 52 + 1.9 * over60 : 49 + 1.7 * over60
      const miller = isMale ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60
      const hamwi = isMale ? 48 + 2.7 * over60 : 45.5 + 2.2 * over60

      const average = (devine + robinson + miller + hamwi) / 4

      return {
        value: `${average.toFixed(1)} kg`,
        raw: average,
        secondary: [
          {
            label: 'ideal-weight-calculator.secondary.devine',
            value: `${devine.toFixed(1)} kg`,
          },
          {
            label: 'ideal-weight-calculator.secondary.robinson',
            value: `${robinson.toFixed(1)} kg`,
          },
          {
            label: 'ideal-weight-calculator.secondary.miller',
            value: `${miller.toFixed(1)} kg`,
          },
          {
            label: 'ideal-weight-calculator.secondary.hamwi',
            value: `${hamwi.toFixed(1)} kg`,
          },
        ],
      }
    },
    resultLabel: 'ideal-weight-calculator.resultLabel',
    faq: [
      {
        q: 'ideal-weight-calculator.faq.q1',
        a: 'ideal-weight-calculator.faq.a1',
      },
      {
        q: 'ideal-weight-calculator.faq.q2',
        a: 'ideal-weight-calculator.faq.a2',
      },
      {
        q: 'ideal-weight-calculator.faq.q3',
        a: 'ideal-weight-calculator.faq.a3',
      },
      {
        q: 'ideal-weight-calculator.faq.q4',
        a: 'ideal-weight-calculator.faq.a4',
      },
    ],
    publishedAt: '2025-01-18',
  },
  {
    slug: 'water-intake-calculator',
    category: 'health',
    tags: ['calculator', 'health'],
    title: 'water-intake-calculator.title',
    h1: 'water-intake-calculator.h1',
    description: 'water-intake-calculator.description',
    keywords: ['water-intake-calculator.keywords'],
    inputs: [
      {
        name: 'weight',
        label: 'water-intake-calculator.inputs.weight',
        type: 'number',
        unit: 'kg',
        min: 20,
        max: 300,
        placeholder: '70',
        defaultValue: 70,
      },
      {
        name: 'exercise',
        label: 'water-intake-calculator.inputs.exercise',
        type: 'number',
        unit: 'water-intake-calculator.units.minutes',
        min: 0,
        max: 300,
        step: 5,
        placeholder: '30',
        defaultValue: 30,
      },
      {
        name: 'climate',
        label: 'water-intake-calculator.inputs.climate',
        type: 'select',
        options: [
          {
            value: 'temperate',
            label: 'water-intake-calculator.options.temperate',
          },
          {value: 'hot', label: 'water-intake-calculator.options.hot'},
        ],
        defaultValue: 'temperate',
      },
    ],
    calculate: ({weight, exercise, climate}) => {
      const w = Number(weight)
      const e = Number(exercise)

      if (!Number.isFinite(w) || w <= 0) return {value: '—'}

      const base = w * 35
      const exerciseAdd = (e / 30) * 500
      const climateFactor = climate === 'hot' ? 1.1 : 1

      const ml = base * climateFactor + exerciseAdd
      const liters = ml / 1000
      const glasses = Math.round(ml / 250)

      return {
        value: `${liters.toFixed(1)} L`,
        raw: liters,
        secondary: [
          {
            label: 'water-intake-calculator.secondary.glasses',
            value: `${glasses} × 250 ml`,
          },
          {
            label: 'water-intake-calculator.secondary.base',
            value: `${(base / 1000).toFixed(1)} L`,
          },
          {
            label: 'water-intake-calculator.secondary.exerciseAdd',
            value: `${(exerciseAdd / 1000).toFixed(2)} L`,
          },
        ],
      }
    },
    resultLabel: 'water-intake-calculator.resultLabel',
    faq: [
      {
        q: 'water-intake-calculator.faq.q1',
        a: 'water-intake-calculator.faq.a1',
      },
      {
        q: 'water-intake-calculator.faq.q2',
        a: 'water-intake-calculator.faq.a2',
      },
      {
        q: 'water-intake-calculator.faq.q3',
        a: 'water-intake-calculator.faq.a3',
      },
      {
        q: 'water-intake-calculator.faq.q4',
        a: 'water-intake-calculator.faq.a4',
      },
    ],
    publishedAt: '2025-01-18',
  },
  {
    slug: 'heart-rate-zones-calculator',
    category: 'health',
    tags: ['calculator', 'health'],
    title: 'heart-rate-zones-calculator.title',
    h1: 'heart-rate-zones-calculator.h1',
    description: 'heart-rate-zones-calculator.description',
    keywords: ['heart-rate-zones-calculator.keywords'],
    inputs: [
      {
        name: 'age',
        label: 'heart-rate-zones-calculator.inputs.age',
        type: 'number',
        unit: 'heart-rate-zones-calculator.units.years',
        min: 10,
        max: 100,
        placeholder: '30',
        defaultValue: 30,
      },
      {
        name: 'restingHr',
        label: 'heart-rate-zones-calculator.inputs.restingHr',
        type: 'number',
        unit: 'heart-rate-zones-calculator.units.bpm',
        min: 30,
        max: 120,
        placeholder: '60',
        defaultValue: 60,
        hint: 'heart-rate-zones-calculator.hints.restingHr',
      },
      {
        name: 'method',
        label: 'heart-rate-zones-calculator.inputs.method',
        type: 'select',
        options: [
          {
            value: 'simple',
            label: 'heart-rate-zones-calculator.options.simple',
          },
          {
            value: 'karvonen',
            label: 'heart-rate-zones-calculator.options.karvonen',
          },
        ],
        defaultValue: 'karvonen',
      },
    ],
    calculate: ({age, restingHr, method}) => {
      const a = Number(age)
      const rest = Number(restingHr)

      if (!Number.isFinite(a) || a <= 0) return {value: '—'}

      const maxHr = 220 - a

      const zones = [
        {
          name: 'z1',
          label: 'heart-rate-zones-calculator.zones.z1',
          min: 0.5,
          max: 0.6,
        },
        {
          name: 'z2',
          label: 'heart-rate-zones-calculator.zones.z2',
          min: 0.6,
          max: 0.7,
        },
        {
          name: 'z3',
          label: 'heart-rate-zones-calculator.zones.z3',
          min: 0.7,
          max: 0.8,
        },
        {
          name: 'z4',
          label: 'heart-rate-zones-calculator.zones.z4',
          min: 0.8,
          max: 0.9,
        },
        {
          name: 'z5',
          label: 'heart-rate-zones-calculator.zones.z5',
          min: 0.9,
          max: 1.0,
        },
      ]

      const secondary = zones.map(z => {
        let low: number
        let high: number

        if (method === 'karvonen' && Number.isFinite(rest)) {
          const reserve = maxHr - rest
          low = rest + reserve * z.min
          high = rest + reserve * z.max
        } else {
          low = maxHr * z.min
          high = maxHr * z.max
        }

        return {
          label: z.label,
          value: `${Math.round(low)}–${Math.round(high)} bpm`,
        }
      })

      return {
        value: String(maxHr),
        raw: maxHr,
        secondary,
      }
    },
    resultLabel: 'heart-rate-zones-calculator.resultLabel',
    resultUnit: 'heart-rate-zones-calculator.resultUnit',
    faq: [
      {
        q: 'heart-rate-zones-calculator.faq.q1',
        a: 'heart-rate-zones-calculator.faq.a1',
      },
      {
        q: 'heart-rate-zones-calculator.faq.q2',
        a: 'heart-rate-zones-calculator.faq.a2',
      },
      {
        q: 'heart-rate-zones-calculator.faq.q3',
        a: 'heart-rate-zones-calculator.faq.a3',
      },
      {
        q: 'heart-rate-zones-calculator.faq.q4',
        a: 'heart-rate-zones-calculator.faq.a4',
      },
    ],
    publishedAt: '2025-01-18',
  },
  {
    slug: 'pregnancy-due-date-calculator',
    category: 'health',
    tags: ['calculator', 'health'],
    title: 'pregnancy-due-date-calculator.title',
    h1: 'pregnancy-due-date-calculator.h1',
    description: 'pregnancy-due-date-calculator.description',
    keywords: ['pregnancy-due-date-calculator.keywords'],
    inputs: [
      {
        name: 'method',
        label: 'pregnancy-due-date-calculator.inputs.method',
        type: 'select',
        options: [
          {value: 'lmp', label: 'pregnancy-due-date-calculator.options.lmp'},
          {
            value: 'conception',
            label: 'pregnancy-due-date-calculator.options.conception',
          },
        ],
        defaultValue: 'lmp',
      },
      {
        name: 'date',
        label: 'pregnancy-due-date-calculator.inputs.date',
        type: 'date',
      },
    ],
    calculate: ({method, date}) => {
      if (!date) return {value: '—'}

      const start = new Date(String(date))
      if (Number.isNaN(start.getTime())) return {value: '—'}

      const due = new Date(start)
      if (method === 'conception') {
        due.setDate(due.getDate() + 266)
      } else {
        due.setDate(due.getDate() + 280)
      }

      const today = new Date()
      const daysPregnant = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      )
      const daysLeft = Math.floor(
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )

      const weeksPregnant = Math.floor(daysPregnant / 7)
      const daysInWeek = daysPregnant % 7

      const trimester =
        weeksPregnant < 13 ? 'first' : weeksPregnant < 28 ? 'second' : 'third'

      const dueStr = due.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      return {
        value: dueStr,
        secondary: [
          {
            label: 'pregnancy-due-date-calculator.secondary.currentWeek',
            value: daysPregnant >= 0 ? `${weeksPregnant}w ${daysInWeek}d` : '—',
          },
          {
            label: 'pregnancy-due-date-calculator.secondary.trimester',
            value: `pregnancy-due-date-calculator.trimester.${trimester}`,
          },
          {
            label: 'pregnancy-due-date-calculator.secondary.daysLeft',
            value: daysLeft > 0 ? String(daysLeft) : '—',
          },
        ],
      }
    },
    resultLabel: 'pregnancy-due-date-calculator.resultLabel',
    faq: [
      {
        q: 'pregnancy-due-date-calculator.faq.q1',
        a: 'pregnancy-due-date-calculator.faq.a1',
      },
      {
        q: 'pregnancy-due-date-calculator.faq.q2',
        a: 'pregnancy-due-date-calculator.faq.a2',
      },
      {
        q: 'pregnancy-due-date-calculator.faq.q3',
        a: 'pregnancy-due-date-calculator.faq.a3',
      },
      {
        q: 'pregnancy-due-date-calculator.faq.q4',
        a: 'pregnancy-due-date-calculator.faq.a4',
      },
    ],
    publishedAt: '2025-01-18',
  },
  {
    slug: 'sleep-cycle-calculator',
    category: 'health',
    tags: ['calculator', 'health'],
    title: 'sleep-cycle-calculator.title',
    h1: 'sleep-cycle-calculator.h1',
    description: 'sleep-cycle-calculator.description',
    keywords: ['sleep-cycle-calculator.keywords'],
    inputs: [
      {
        name: 'wakeTime',
        label: 'sleep-cycle-calculator.inputs.wakeTime',
        type: 'text',
        placeholder: '07:00',
        defaultValue: '07:00',
        hint: 'sleep-cycle-calculator.hints.wakeTime',
      },
    ],
    calculate: ({wakeTime}) => {
      const match = String(wakeTime).match(/^(\d{1,2}):(\d{2})$/)
      if (!match) return {value: '—'}

      const hours = Number(match[1])
      const minutes = Number(match[2])
      if (hours > 23 || minutes > 59) return {value: '—'}

      const wake = hours * 60 + minutes
      const fallAsleep = 15
      const cycle = 90

      const bedtimeFor = (cycles: number) => {
        const total = cycles * cycle + fallAsleep
        let bed = wake - total
        while (bed < 0) bed += 24 * 60
        const h = Math.floor(bed / 60)
        const m = bed % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }

      const options = [6, 5, 4].map(c => ({
        label:
          c === 6
            ? 'sleep-cycle-calculator.secondary.six'
            : c === 5
              ? 'sleep-cycle-calculator.secondary.five'
              : 'sleep-cycle-calculator.secondary.four',
        value: `${bedtimeFor(c)} (${c * 1.5}h)`,
      }))

      return {
        value: bedtimeFor(5),
        secondary: options,
      }
    },
    resultLabel: 'sleep-cycle-calculator.resultLabel',
    resultUnit: 'sleep-cycle-calculator.resultUnit',
    faq: [
      {q: 'sleep-cycle-calculator.faq.q1', a: 'sleep-cycle-calculator.faq.a1'},
      {q: 'sleep-cycle-calculator.faq.q2', a: 'sleep-cycle-calculator.faq.a2'},
      {q: 'sleep-cycle-calculator.faq.q3', a: 'sleep-cycle-calculator.faq.a3'},
      {q: 'sleep-cycle-calculator.faq.q4', a: 'sleep-cycle-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-18',
  },
  {
    slug: 'vo2-max-estimator',
    category: 'health',
    tags: ['calculator', 'health'],
    title: 'vo2-max-estimator.title',
    h1: 'vo2-max-estimator.h1',
    description: 'vo2-max-estimator.description',
    keywords: ['vo2-max-estimator.keywords'],
    inputs: [
      {
        name: 'gender',
        label: 'vo2-max-estimator.inputs.gender',
        type: 'select',
        options: [
          {value: 'male', label: 'vo2-max-estimator.options.male'},
          {value: 'female', label: 'vo2-max-estimator.options.female'},
        ],
        defaultValue: 'male',
      },
      {
        name: 'age',
        label: 'vo2-max-estimator.inputs.age',
        type: 'number',
        unit: 'vo2-max-estimator.units.years',
        min: 15,
        max: 80,
        placeholder: '30',
        defaultValue: 30,
      },
      {
        name: 'weight',
        label: 'vo2-max-estimator.inputs.weight',
        type: 'number',
        unit: 'kg',
        min: 30,
        max: 200,
        placeholder: '70',
        defaultValue: 70,
      },
      {
        name: 'heartRate',
        label: 'vo2-max-estimator.inputs.heartRate',
        type: 'number',
        unit: 'vo2-max-estimator.units.bpm',
        min: 60,
        max: 220,
        placeholder: '140',
        defaultValue: 140,
        hint: 'vo2-max-estimator.hints.heartRate',
      },
      {
        name: 'timeMinutes',
        label: 'vo2-max-estimator.inputs.timeMinutes',
        type: 'number',
        unit: 'vo2-max-estimator.units.min',
        min: 5,
        max: 30,
        step: 0.1,
        placeholder: '14',
        defaultValue: 14,
      },
    ],
    calculate: ({gender, age, weight, heartRate, timeMinutes}) => {
      const a = Number(age)
      const w = Number(weight)
      const hr = Number(heartRate)
      const t = Number(timeMinutes)

      if (!Number.isFinite(a) || a <= 0) return {value: '—'}
      if (!Number.isFinite(w) || w <= 0) return {value: '—'}
      if (!Number.isFinite(hr) || hr <= 0) return {value: '—'}
      if (!Number.isFinite(t) || t <= 0) return {value: '—'}

      const genderFactor = gender === 'male' ? 1 : 0

      const vo2 =
        132.853 -
        0.0769 * w -
        0.3877 * a +
        6.315 * genderFactor -
        3.2649 * t -
        0.1565 * hr

      if (!Number.isFinite(vo2)) return {value: '—'}

      let category: string
      if (gender === 'male') {
        if (vo2 >= 55) category = 'excellent'
        else if (vo2 >= 45) category = 'good'
        else if (vo2 >= 38) category = 'aboveAverage'
        else if (vo2 >= 30) category = 'average'
        else category = 'belowAverage'
      } else {
        if (vo2 >= 49) category = 'excellent'
        else if (vo2 >= 40) category = 'good'
        else if (vo2 >= 33) category = 'aboveAverage'
        else if (vo2 >= 26) category = 'average'
        else category = 'belowAverage'
      }

      return {
        value: vo2.toFixed(1),
        raw: vo2,
        secondary: [
          {
            label: 'vo2-max-estimator.secondary.category',
            value: `vo2-max-estimator.categories.${category}`,
          },
        ],
      }
    },
    resultLabel: 'vo2-max-estimator.resultLabel',
    resultUnit: 'vo2-max-estimator.resultUnit',
    faq: [
      {q: 'vo2-max-estimator.faq.q1', a: 'vo2-max-estimator.faq.a1'},
      {q: 'vo2-max-estimator.faq.q2', a: 'vo2-max-estimator.faq.a2'},
      {q: 'vo2-max-estimator.faq.q3', a: 'vo2-max-estimator.faq.a3'},
      {q: 'vo2-max-estimator.faq.q4', a: 'vo2-max-estimator.faq.a4'},
    ],
    publishedAt: '2025-01-18',
  },
  {
    slug: 'sleep-debt-calculator',
    category: 'health',
    tags: ['health', 'calculator'],
    title: 'sleep-debt-calculator.title',
    h1: 'sleep-debt-calculator.h1',
    description: 'sleep-debt-calculator.description',
    keywords: ['sleep-debt-calculator.keywords'],
    inputs: [
      {
        name: 'targetSleep',
        label: 'sleep-debt-calculator.inputs.targetSleep',
        type: 'slider',
        min: 6,
        max: 10,
        step: 0.5,
        unit: 'sleep-debt-calculator.units.hours',
        defaultValue: 8,
        hint: 'sleep-debt-calculator.hints.targetSleep',
      },
      {
        name: 'actualSleep',
        label: 'sleep-debt-calculator.inputs.actualSleep',
        type: 'slider',
        min: 3,
        max: 10,
        step: 0.5,
        unit: 'sleep-debt-calculator.units.hours',
        defaultValue: 6.5,
      },
      {
        name: 'days',
        label: 'sleep-debt-calculator.inputs.days',
        type: 'slider',
        min: 1,
        max: 60,
        step: 1,
        unit: 'sleep-debt-calculator.units.days',
        defaultValue: 7,
      },
    ],
    calculate: ({targetSleep, actualSleep, days}) => {
      const target = Number(targetSleep)
      const actual = Number(actualSleep)
      const d = Number(days)

      if (!Number.isFinite(target) || target <= 0) return {value: '—'}
      if (!Number.isFinite(actual) || actual < 0) return {value: '—'}
      if (!Number.isFinite(d) || d <= 0) return {value: '—'}

      const perNight = Math.max(0, target - actual)
      const totalDebt = perNight * d
      const recoveryNights = perNight > 0 ? Math.ceil(totalDebt) : 0

      let level: 'none' | 'mild' | 'moderate' | 'severe'
      if (totalDebt === 0) level = 'none'
      else if (totalDebt <= 5) level = 'mild'
      else if (totalDebt <= 15) level = 'moderate'
      else level = 'severe'

      return {
        value: 'sleep-debt-calculator.value',
        params: {value: totalDebt.toFixed(1)},
        raw: totalDebt,
        secondary: [
          {
            label: 'sleep-debt-calculator.secondary.perNight',
            value: 'sleep-debt-calculator.secondary.perNightValue',
            params: {count: perNight === 0 ? 0 : `−${perNight.toFixed(1)}`},
          },
          {
            label: 'sleep-debt-calculator.secondary.level',
            value: `sleep-debt-calculator.levels.${level}`,
          },
          {
            label: 'sleep-debt-calculator.secondary.recoveryValue',
            value: 'sleep-debt-calculator.secondary.recoveryValueText',
            params: {count: recoveryNights},
          },
          {
            label: 'sleep-debt-calculator.secondary.equivalent',
            value: (totalDebt / target).toFixed(1),
          },
        ],
      }
    },
    resultLabel: 'sleep-debt-calculator.resultLabel',
    resultUnit: 'sleep-debt-calculator.resultUnit',
    faq: [
      {
        q: 'sleep-debt-calculator.faq.q1',
        a: 'sleep-debt-calculator.faq.a1',
      },
      {
        q: 'sleep-debt-calculator.faq.q2',
        a: 'sleep-debt-calculator.faq.a2',
      },
      {
        q: 'sleep-debt-calculator.faq.q3',
        a: 'sleep-debt-calculator.faq.a3',
      },
      {
        q: 'sleep-debt-calculator.faq.q4',
        a: 'sleep-debt-calculator.faq.a4',
      },
    ],
    related: ['sleep-cycle-calculator', 'heart-rate-zones-calculator'],
    publishedAt: '2026-09-29',
  },
  {
    slug: 'menstrual-cycle-calculator',
    category: 'health',
    tags: ['health', 'calculator'],
    title: 'menstrual-cycle-calculator.title',
    h1: 'menstrual-cycle-calculator.h1',
    description: 'menstrual-cycle-calculator.description',
    keywords: ['menstrual-cycle-calculator.keywords'],
    inputs: [
      {
        name: 'lastPeriod',
        label: 'menstrual-cycle-calculator.inputs.lastPeriod',
        type: 'date',
        hint: 'menstrual-cycle-calculator.hints.lastPeriod',
      },
      {
        name: 'cycleLength',
        label: 'menstrual-cycle-calculator.inputs.cycleLength',
        type: 'slider',
        min: 21,
        max: 40,
        step: 1,
        unit: 'menstrual-cycle-calculator.units.days',
        defaultValue: 28,
      },
      {
        name: 'periodLength',
        label: 'menstrual-cycle-calculator.inputs.periodLength',
        type: 'slider',
        min: 2,
        max: 10,
        step: 1,
        unit: 'menstrual-cycle-calculator.units.days',
        defaultValue: 5,
      },
      {
        name: 'lutealPhase',
        label: 'menstrual-cycle-calculator.inputs.lutealPhase',
        type: 'slider',
        min: 10,
        max: 16,
        step: 1,
        unit: 'menstrual-cycle-calculator.units.days',
        defaultValue: 14,
        hint: 'menstrual-cycle-calculator.hints.lutealPhase',
      },
    ],
    calculate: ({lastPeriod, cycleLength, periodLength, lutealPhase}, ctx) => {
      if (!lastPeriod) return {value: '—'}

      const locale = ctx?.locale ?? 'en'

      const start = new Date(String(lastPeriod))
      if (Number.isNaN(start.getTime())) return {value: '—'}

      const cycle = Number(cycleLength)
      const period = Number(periodLength)
      const luteal = Number(lutealPhase)

      if (!Number.isFinite(cycle) || cycle <= 0) return {value: '—'}
      if (!Number.isFinite(period) || period <= 0) return {value: '—'}
      if (!Number.isFinite(luteal) || luteal <= 0) return {value: '—'}

      const dayMs = 1000 * 60 * 60 * 24

      const addDays = (base: Date, days: number) =>
        new Date(base.getTime() + days * dayMs)

      const fmtShort = (d: Date) =>
        d
          .toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
          .replace(/\s*г\.$/, '')

      const fmtDayMonth = (d: Date) =>
        d.toLocaleDateString(locale, {month: 'short', day: 'numeric'})

      const nextPeriod = addDays(start, cycle)
      const ovulation = addDays(nextPeriod, -luteal)
      const fertileFrom = addDays(ovulation, -5)
      const fertileTo = ovulation
      const period2 = addDays(nextPeriod, cycle)
      const period3 = addDays(period2, cycle)

      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const startDay = new Date(start)
      startDay.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((now.getTime() - startDay.getTime()) / dayMs)
      const currentDay = diffDays >= 0 ? (diffDays % cycle) + 1 : null

      return {
        value: fmtShort(nextPeriod),
        secondary: [
          {
            label: 'menstrual-cycle-calculator.secondary.ovulation',
            value: fmtDayMonth(ovulation),
          },
          {
            label: 'menstrual-cycle-calculator.secondary.fertileWindow',
            value: `${fmtDayMonth(fertileFrom)} – ${fmtDayMonth(fertileTo)}`,
          },
          {
            label: 'menstrual-cycle-calculator.secondary.next3',
            value: `${fmtDayMonth(nextPeriod)}, ${fmtDayMonth(period2)}, ${fmtDayMonth(period3)}`,
          },
          ...(currentDay !== null
            ? [
                {
                  label: 'menstrual-cycle-calculator.secondary.currentDay',
                  value: String(currentDay),
                },
              ]
            : []),
        ],
      }
    },
    resultLabel: 'menstrual-cycle-calculator.resultLabel',
    resultUnit: 'menstrual-cycle-calculator.resultUnit',
    faq: [
      {
        q: 'menstrual-cycle-calculator.faq.q1',
        a: 'menstrual-cycle-calculator.faq.a1',
      },
      {
        q: 'menstrual-cycle-calculator.faq.q2',
        a: 'menstrual-cycle-calculator.faq.a2',
      },
      {
        q: 'menstrual-cycle-calculator.faq.q3',
        a: 'menstrual-cycle-calculator.faq.a3',
      },
      {
        q: 'menstrual-cycle-calculator.faq.q4',
        a: 'menstrual-cycle-calculator.faq.a4',
      },
    ],
    related: ['pregnancy-due-date-calculator', 'calorie-calculator'],
    publishedAt: '2026-09-29',
  },
  {
    slug: 'calorie-deficit-planner',
    category: 'health',
    tags: ['health', 'calculator'],
    title: 'calorie-deficit-planner.title',
    h1: 'calorie-deficit-planner.h1',
    description: 'calorie-deficit-planner.description',
    keywords: ['calorie-deficit-planner.keywords'],
    inputs: [
      {
        name: 'age',
        label: 'calorie-deficit-planner.inputs.age',
        type: 'number',
        min: 14,
        max: 100,
        defaultValue: 30,
      },
      {
        name: 'gender',
        label: 'calorie-deficit-planner.inputs.gender',
        type: 'select',
        options: [
          {value: 'male', label: 'calorie-deficit-planner.options.male'},
          {value: 'female', label: 'calorie-deficit-planner.options.female'},
        ],
        defaultValue: 'male',
      },
      {
        name: 'height',
        label: 'calorie-deficit-planner.inputs.height',
        type: 'number',
        unit: 'cm',
        min: 100,
        max: 250,
        defaultValue: 175,
      },
      {
        name: 'currentWeight',
        label: 'calorie-deficit-planner.inputs.currentWeight',
        type: 'number',
        unit: 'kg',
        min: 30,
        max: 300,
        defaultValue: 80,
      },
      {
        name: 'goalWeight',
        label: 'calorie-deficit-planner.inputs.goalWeight',
        type: 'number',
        unit: 'kg',
        min: 30,
        max: 300,
        defaultValue: 70,
      },
      {
        name: 'activity',
        label: 'calorie-deficit-planner.inputs.activity',
        type: 'select',
        options: [
          {value: '1.2', label: 'calorie-deficit-planner.options.sedentary'},
          {value: '1.375', label: 'calorie-deficit-planner.options.light'},
          {value: '1.55', label: 'calorie-deficit-planner.options.moderate'},
          {value: '1.725', label: 'calorie-deficit-planner.options.high'},
          {value: '1.9', label: 'calorie-deficit-planner.options.veryHigh'},
        ],
        defaultValue: '1.55',
      },
      {
        name: 'timeframe',
        label: 'calorie-deficit-planner.inputs.timeframe',
        type: 'slider',
        min: 4,
        max: 104,
        step: 1,
        unit: 'calorie-deficit-planner.units.weeks',
        defaultValue: 16,
      },
    ],
    calculate: (
      {age, gender, height, currentWeight, goalWeight, activity, timeframe},
      {locale},
    ) => {
      function formatInt(n: number): string {
        if (!Number.isFinite(n)) return '—'
        return Math.round(n).toLocaleString(locale ?? 'en')
      }

      const a = Number(age)
      const h = Number(height)
      const cw = Number(currentWeight)
      const gw = Number(goalWeight)
      const act = Number(activity)
      const weeks = Number(timeframe)

      if (!Number.isFinite(a) || a <= 0) return {value: '—'}
      if (!Number.isFinite(h) || h <= 0) return {value: '—'}
      if (!Number.isFinite(cw) || cw <= 0) return {value: '—'}
      if (!Number.isFinite(gw) || gw <= 0) return {value: '—'}
      if (!Number.isFinite(weeks) || weeks <= 0) return {value: '—'}

      const bmr =
        gender === 'male'
          ? 10 * cw + 6.25 * h - 5 * a + 5
          : 10 * cw + 6.25 * h - 5 * a - 161

      const tdee = bmr * act
      const weightToLose = cw - gw
      const days = weeks * 7
      const totalDeficit = weightToLose * 7700
      const dailyDeficit = totalDeficit / days
      const perWeek = weightToLose / weeks

      const minCalories = gender === 'male' ? 1500 : 1200
      const targetRaw = tdee - dailyDeficit
      const targetCalories = Math.max(minCalories, targetRaw)

      let level: 'healthy' | 'tooSlow' | 'tooFast'
      if (dailyDeficit > 1000) level = 'tooFast'
      else if (dailyDeficit < 200) level = 'tooSlow'
      else level = 'healthy'

      return {
        value: formatInt(targetCalories),
        raw: targetCalories,
        secondary: [
          {
            label: 'calorie-deficit-planner.secondary.bmr',
            value: formatInt(bmr),
          },
          {
            label: 'calorie-deficit-planner.secondary.tdee',
            value: formatInt(tdee),
          },
          {
            label: 'calorie-deficit-planner.secondary.dailyDeficit',
            value: formatInt(dailyDeficit),
          },
          {
            label: 'calorie-deficit-planner.secondary.perWeek',
            value: perWeek.toFixed(2),
          },
          {
            label: 'calorie-deficit-planner.secondary.level',
            value: `calorie-deficit-planner.levels.${level}`,
          },
        ],
      }
    },
    resultLabel: 'calorie-deficit-planner.resultLabel',
    resultUnit: 'calorie-deficit-planner.resultUnit',
    faq: [
      {
        q: 'calorie-deficit-planner.faq.q1',
        a: 'calorie-deficit-planner.faq.a1',
      },
      {
        q: 'calorie-deficit-planner.faq.q2',
        a: 'calorie-deficit-planner.faq.a2',
      },
      {
        q: 'calorie-deficit-planner.faq.q3',
        a: 'calorie-deficit-planner.faq.a3',
      },
      {
        q: 'calorie-deficit-planner.faq.q4',
        a: 'calorie-deficit-planner.faq.a4',
      },
    ],
    related: ['calorie-calculator', 'tdee-macro-calculator'],
    publishedAt: '2026-09-29',
  },
  {
    slug: 'pregnancy-week-tracker',
    category: 'health',
    tags: ['health', 'calculator'],
    title: 'pregnancy-week-tracker.title',
    h1: 'pregnancy-week-tracker.h1',
    description: 'pregnancy-week-tracker.description',
    keywords: ['pregnancy-week-tracker.keywords'],
    inputs: [
      {
        name: 'method',
        label: 'pregnancy-week-tracker.inputs.method',
        type: 'select',
        options: [
          {
            value: 'lmp',
            label: 'pregnancy-week-tracker.options.lmp',
          },
          {
            value: 'dueDate',
            label: 'pregnancy-week-tracker.options.dueDate',
          },
        ],
        defaultValue: 'lmp',
      },
      {
        name: 'date',
        label: 'pregnancy-week-tracker.inputs.date',
        type: 'date',
        hint: 'pregnancy-week-tracker.hints.date',
      },
    ],
    calculate: ({method, date}, {locale}) => {
      if (!date) return {value: '—'}

      const start = new Date(String(date))
      if (Number.isNaN(start.getTime())) return {value: '—'}

      // Determine LMP and due date from the given input
      let lmp: Date
      let due: Date
      if (method === 'dueDate') {
        due = new Date(start)
        lmp = new Date(start)
        lmp.setDate(lmp.getDate() - 280)
      } else {
        lmp = new Date(start)
        due = new Date(start)
        due.setDate(due.getDate() + 280)
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lmpDay = new Date(lmp)
      lmpDay.setHours(0, 0, 0, 0)

      const dayMs = 1000 * 60 * 60 * 24
      const daysPregnant = Math.floor(
        (today.getTime() - lmpDay.getTime()) / dayMs,
      )
      const daysLeft = Math.floor((due.getTime() - today.getTime()) / dayMs)

      if (daysPregnant < 0) return {value: '—'}

      const weeks = Math.floor(daysPregnant / 7)
      const days = daysPregnant % 7
      const progress = Math.min(100, (daysPregnant / 280) * 100)

      const trimester = weeks < 13 ? 'first' : weeks < 28 ? 'second' : 'third'

      const fmtLong = (d: Date) =>
        d.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

      return {
        value: `${weeks}w ${days}d`,
        secondary: [
          {
            label: 'pregnancy-week-tracker.secondary.trimester',
            value: `pregnancy-week-tracker.trimester.${trimester}`,
          },
          {
            label: 'pregnancy-week-tracker.secondary.daysLeft',
            value: daysLeft > 0 ? String(daysLeft) : '0',
          },
          {
            label: 'pregnancy-week-tracker.secondary.progress',
            value: `${progress.toFixed(1)}%`,
          },
          {
            label: 'pregnancy-week-tracker.secondary.dueDate',
            value: fmtLong(due),
          },
        ],
      }
    },
    resultLabel: 'pregnancy-week-tracker.resultLabel',
    resultUnit: 'pregnancy-week-tracker.resultUnit',
    faq: [
      {
        q: 'pregnancy-week-tracker.faq.q1',
        a: 'pregnancy-week-tracker.faq.a1',
      },
      {
        q: 'pregnancy-week-tracker.faq.q2',
        a: 'pregnancy-week-tracker.faq.a2',
      },
      {
        q: 'pregnancy-week-tracker.faq.q3',
        a: 'pregnancy-week-tracker.faq.a3',
      },
      {
        q: 'pregnancy-week-tracker.faq.q4',
        a: 'pregnancy-week-tracker.faq.a4',
      },
    ],
    related: ['pregnancy-due-date-calculator', 'menstrual-cycle-calculator'],
    publishedAt: '2026-09-29',
  },
]
