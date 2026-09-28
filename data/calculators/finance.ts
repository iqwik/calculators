import type {CalculatorConfig} from '@/types'

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return parseFloat(n.toFixed(4)).toString()
}

function formatAmount(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatInt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return Math.round(n).toLocaleString('en-US')
}

export const financeCalculators: CalculatorConfig[] = [
  {
    slug: 'percentage-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'percentage-calculator.title',
    h1: 'percentage-calculator.h1',
    description: 'percentage-calculator.description',
    keywords: ['percentage-calculator.keywords'],
    inputs: [
      {
        name: 'mode',
        label: 'percentage-calculator.inputs.mode',
        type: 'select',
        options: [
          {value: 'of', label: 'percentage-calculator.options.of'},
          {value: 'what', label: 'percentage-calculator.options.what'},
          {value: 'change', label: 'percentage-calculator.options.change'},
        ],
        defaultValue: 'of',
      },
      {
        name: 'valueX',
        label: 'percentage-calculator.inputs.valueX',
        type: 'number',
        placeholder: '15',
        step: 0.01,
        defaultValue: 15,
      },
      {
        name: 'valueY',
        label: 'percentage-calculator.inputs.valueY',
        type: 'number',
        placeholder: '200',
        step: 0.01,
        defaultValue: 200,
      },
    ],
    calculate: ({mode, valueX, valueY}) => {
      const x = Number(valueX)
      const y = Number(valueY)

      if (mode === 'of') {
        const result = (x / 100) * y
        return {
          value: fmt(result),
          secondary: [
            {
              label: 'percentage-calculator.secondary.formula',
              value: `${fmt(x)}% × ${fmt(y)}`,
            },
          ],
        }
      }

      if (mode === 'what') {
        if (y === 0) return {value: '—'}
        const result = (x / y) * 100
        return {
          value: `${fmt(result)}%`,
          secondary: [
            {
              label: 'percentage-calculator.secondary.formula',
              value: `${fmt(x)} ÷ ${fmt(y)} × 100`,
            },
          ],
        }
      }

      if (x === 0) return {value: '—'}
      const diff = y - x
      const result = (diff / Math.abs(x)) * 100
      const sign = result > 0 ? '+' : ''

      return {
        value: `${sign}${fmt(result)}%`,
        secondary: [
          {label: 'percentage-calculator.secondary.from', value: fmt(x)},
          {label: 'percentage-calculator.secondary.to', value: fmt(y)},
          {
            label: 'percentage-calculator.secondary.difference',
            value: `${diff > 0 ? '+' : ''}${fmt(diff)}`,
          },
        ],
      }
    },
    resultLabel: 'percentage-calculator.resultLabel',
    faq: [
      {q: 'percentage-calculator.faq.q1', a: 'percentage-calculator.faq.a1'},
      {q: 'percentage-calculator.faq.q2', a: 'percentage-calculator.faq.a2'},
      {q: 'percentage-calculator.faq.q3', a: 'percentage-calculator.faq.a3'},
      {q: 'percentage-calculator.faq.q4', a: 'percentage-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-15',
  },
  {
    slug: 'emi-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'emi-calculator.title',
    h1: 'emi-calculator.h1',
    description: 'emi-calculator.description',
    keywords: ['emi-calculator.keywords'],
    inputs: [
      {
        name: 'principal',
        label: 'emi-calculator.inputs.principal',
        type: 'slider',
        min: 1000,
        max: 100000000,
        step: 1000,
        placeholder: '500000',
        defaultValue: 500000,
      },
      {
        name: 'rate',
        label: 'emi-calculator.inputs.rate',
        type: 'slider',
        unit: '%',
        min: 0,
        max: 50,
        step: 0.01,
        placeholder: '8.5',
        defaultValue: 8.5,
      },
      {
        name: 'tenure',
        label: 'emi-calculator.inputs.tenure',
        type: 'slider',
        min: 1,
        max: 40,
        step: 1,
        placeholder: '20',
        defaultValue: 20,
      },
    ],
    calculate: ({principal, rate, tenure}) => {
      const P = Number(principal)
      const annualRate = Number(rate)
      const years = Number(tenure)

      if (!Number.isFinite(P) || P <= 0) return {value: '—'}
      if (!Number.isFinite(years) || years <= 0) return {value: '—'}

      const n = Math.round(years * 12)
      const r = annualRate / 12 / 100

      let emi: number
      if (r === 0) {
        emi = P / n
      } else {
        const pow = (1 + r) ** n
        emi = (P * r * pow) / (pow - 1)
      }

      const totalPayment = emi * n
      const totalInterest = totalPayment - P
      const interestShare = (totalInterest / totalPayment) * 100

      return {
        value: formatAmount(emi),
        raw: emi,
        secondary: [
          {
            label: 'emi-calculator.secondary.principal',
            value: formatInt(P),
          },
          {
            label: 'emi-calculator.secondary.totalInterest',
            value: formatInt(totalInterest),
          },
          {
            label: 'emi-calculator.secondary.totalPayment',
            value: formatInt(totalPayment),
          },
          {
            label: 'emi-calculator.secondary.months',
            value: String(n),
          },
          {
            label: 'emi-calculator.secondary.interestShare',
            value: `${interestShare.toFixed(1)}%`,
          },
        ],
      }
    },
    resultLabel: 'emi-calculator.resultLabel',
    resultUnit: 'emi-calculator.resultUnit',
    faq: [
      {q: 'emi-calculator.faq.q1', a: 'emi-calculator.faq.a1'},
      {q: 'emi-calculator.faq.q2', a: 'emi-calculator.faq.a2'},
      {q: 'emi-calculator.faq.q3', a: 'emi-calculator.faq.a3'},
      {q: 'emi-calculator.faq.q4', a: 'emi-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-16',
  },
  {
    slug: 'compound-interest-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'compound-interest-calculator.title',
    h1: 'compound-interest-calculator.h1',
    description: 'compound-interest-calculator.description',
    keywords: ['compound-interest-calculator.keywords'],
    inputs: [
      {
        name: 'principal',
        label: 'compound-interest-calculator.inputs.principal',
        type: 'slider',
        min: 1000,
        max: 100000000,
        step: 1000,
        defaultValue: 100000,
      },
      {
        name: 'rate',
        label: 'compound-interest-calculator.inputs.rate',
        type: 'slider',
        min: 0.1,
        max: 100,
        step: 0.1,
        defaultValue: 8,
      },
      {
        name: 'years',
        label: 'compound-interest-calculator.inputs.years',
        type: 'slider',
        min: 0.1,
        max: 100,
        step: 1,
        defaultValue: 10,
      },
      {
        name: 'frequency',
        label: 'compound-interest-calculator.inputs.frequency',
        type: 'select',
        options: [
          {
            value: '1',
            label: 'compound-interest-calculator.options.annually',
          },
          {
            value: '2',
            label: 'compound-interest-calculator.options.semiannually',
          },
          {
            value: '4',
            label: 'compound-interest-calculator.options.quarterly',
          },
          {
            value: '12',
            label: 'compound-interest-calculator.options.monthly',
          },
          {
            value: '365',
            label: 'compound-interest-calculator.options.daily',
          },
        ],
        defaultValue: '12',
      },
    ],
    calculate: ({principal, rate, years, frequency}) => {
      const P = Number(principal)
      const r = Number(rate) / 100
      const t = Number(years)
      const n = Number(frequency)

      if (!Number.isFinite(P) || P <= 0) return {value: '—'}
      if (!Number.isFinite(t) || t <= 0) return {value: '—'}
      if (!Number.isFinite(n) || n <= 0) return {value: '—'}

      const A = P * (1 + r / n) ** (n * t)
      const interest = A - P
      const ear = ((1 + r / n) ** n - 1) * 100
      const periods = Math.round(n * t)

      return {
        value: formatInt(A),
        raw: A,
        secondary: [
          {
            label: 'compound-interest-calculator.secondary.principal',
            value: formatInt(P),
          },
          {
            label: 'compound-interest-calculator.secondary.interest',
            value: formatInt(interest),
          },
          {
            label: 'compound-interest-calculator.secondary.ear',
            value: `${ear.toFixed(2)}%`,
          },
          {
            label: 'compound-interest-calculator.secondary.periods',
            value: String(periods),
          },
        ],
      }
    },
    resultLabel: 'compound-interest-calculator.resultLabel',
    faq: [
      {
        q: 'compound-interest-calculator.faq.q1',
        a: 'compound-interest-calculator.faq.a1',
      },
      {
        q: 'compound-interest-calculator.faq.q2',
        a: 'compound-interest-calculator.faq.a2',
      },
      {
        q: 'compound-interest-calculator.faq.q3',
        a: 'compound-interest-calculator.faq.a3',
      },
      {
        q: 'compound-interest-calculator.faq.q4',
        a: 'compound-interest-calculator.faq.a4',
      },
    ],
    publishedAt: '2025-01-17',
  },
  {
    slug: 'discount-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'discount-calculator.title',
    h1: 'discount-calculator.h1',
    description: 'discount-calculator.description',
    keywords: ['discount-calculator.keywords'],
    inputs: [
      {
        name: 'price',
        label: 'discount-calculator.inputs.price',
        type: 'slider',
        min: 1,
        max: 100000,
        step: 1,
        defaultValue: 100,
      },
      {
        name: 'discount',
        label: 'discount-calculator.inputs.discount',
        type: 'slider',
        min: 0,
        max: 90,
        step: 1,
        defaultValue: 20,
      },
      {
        name: 'tax',
        label: 'discount-calculator.inputs.tax',
        type: 'slider',
        min: 0,
        max: 30,
        step: 0.5,
        defaultValue: 0,
      },
    ],
    calculate: ({price, discount, tax}) => {
      const P = Number(price)
      const d = Number(discount)
      const tx = Number(tax)

      if (!Number.isFinite(P) || P < 0) return {value: '—'}

      const savings = (P * d) / 100
      const discounted = P - savings
      const taxAmount = (discounted * tx) / 100
      const final = discounted + taxAmount

      return {
        value: formatInt(final),
        raw: final,
        secondary: [
          {
            label: 'discount-calculator.secondary.original',
            value: formatInt(P),
          },
          {
            label: 'discount-calculator.secondary.savings',
            value: formatInt(savings),
          },
          {
            label: 'discount-calculator.secondary.discounted',
            value: formatInt(discounted),
          },
          {
            label: 'discount-calculator.secondary.taxAmount',
            value: formatInt(taxAmount),
          },
        ],
      }
    },
    resultLabel: 'discount-calculator.resultLabel',
    faq: [
      {q: 'discount-calculator.faq.q1', a: 'discount-calculator.faq.a1'},
      {q: 'discount-calculator.faq.q2', a: 'discount-calculator.faq.a2'},
      {q: 'discount-calculator.faq.q3', a: 'discount-calculator.faq.a3'},
      {q: 'discount-calculator.faq.q4', a: 'discount-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-17',
  },
  {
    slug: 'tip-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'tip-calculator.title',
    h1: 'tip-calculator.h1',
    description: 'tip-calculator.description',
    keywords: ['tip-calculator.keywords'],
    inputs: [
      {
        name: 'bill',
        label: 'tip-calculator.inputs.bill',
        type: 'slider',
        min: 1,
        max: 100000,
        step: 1,
        defaultValue: 100,
      },
      {
        name: 'tip',
        label: 'tip-calculator.inputs.tip',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 15,
      },
      {
        name: 'people',
        label: 'tip-calculator.inputs.people',
        type: 'slider',
        min: 1,
        max: 30,
        step: 1,
        defaultValue: 1,
      },
    ],
    calculate: ({bill, tip, people}) => {
      const B = Number(bill)
      const t = Number(tip)
      const p = Number(people)

      if (!Number.isFinite(B) || B < 0) return {value: '—'}
      if (!Number.isFinite(p) || p < 1) return {value: '—'}

      const tipAmount = (B * t) / 100
      const total = B + tipAmount
      const perPerson = total / p

      return {
        value: formatInt(perPerson),
        raw: perPerson,
        secondary: [
          {label: 'tip-calculator.secondary.bill', value: formatInt(B)},
          {
            label: 'tip-calculator.secondary.tipAmount',
            value: formatInt(tipAmount),
          },
          {label: 'tip-calculator.secondary.total', value: formatInt(total)},
          {label: 'tip-calculator.secondary.people', value: String(p)},
        ],
      }
    },
    resultLabel: 'tip-calculator.resultLabel',
    resultUnit: 'tip-calculator.resultUnit',
    faq: [
      {q: 'tip-calculator.faq.q1', a: 'tip-calculator.faq.a1'},
      {q: 'tip-calculator.faq.q2', a: 'tip-calculator.faq.a2'},
      {q: 'tip-calculator.faq.q3', a: 'tip-calculator.faq.a3'},
      {q: 'tip-calculator.faq.q4', a: 'tip-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-17',
  },
  {
    slug: 'gst-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'gst-calculator.title',
    h1: 'gst-calculator.h1',
    description: 'gst-calculator.description',
    keywords: ['gst-calculator.keywords'],
    inputs: [
      {
        name: 'amount',
        label: 'gst-calculator.inputs.amount',
        type: 'slider',
        min: 1,
        max: 1000000,
        step: 100,
        defaultValue: 10000,
      },
      {
        name: 'rate',
        label: 'gst-calculator.inputs.rate',
        type: 'select',
        options: [
          {value: '5', label: 'gst-calculator.options.r5'},
          {value: '12', label: 'gst-calculator.options.r12'},
          {value: '18', label: 'gst-calculator.options.r18'},
          {value: '28', label: 'gst-calculator.options.r28'},
        ],
        defaultValue: '18',
      },
      {
        name: 'type',
        label: 'gst-calculator.inputs.type',
        type: 'select',
        options: [
          {value: 'exclusive', label: 'gst-calculator.options.exclusive'},
          {value: 'inclusive', label: 'gst-calculator.options.inclusive'},
        ],
        defaultValue: 'exclusive',
      },
    ],
    calculate: ({amount, rate, type}) => {
      const A = Number(amount)
      const r = Number(rate)

      if (!Number.isFinite(A) || A <= 0) return {value: '—'}

      let base: number
      let gst: number
      let total: number

      if (type === 'exclusive') {
        base = A
        gst = (A * r) / 100
        total = A + gst
      } else {
        base = A / (1 + r / 100)
        gst = A - base
        total = A
      }

      const half = gst / 2

      return {
        value: formatInt(total),
        raw: total,
        secondary: [
          {
            label: 'gst-calculator.secondary.base',
            value: formatInt(base),
          },
          {
            label: 'gst-calculator.secondary.gst',
            value: formatInt(gst),
          },
          {
            label: 'gst-calculator.secondary.cgst',
            value: formatInt(half),
          },
          {
            label: 'gst-calculator.secondary.sgst',
            value: formatInt(half),
          },
        ],
      }
    },
    resultLabel: 'gst-calculator.resultLabel',
    faq: [
      {q: 'gst-calculator.faq.q1', a: 'gst-calculator.faq.a1'},
      {q: 'gst-calculator.faq.q2', a: 'gst-calculator.faq.a2'},
      {q: 'gst-calculator.faq.q3', a: 'gst-calculator.faq.a3'},
      {q: 'gst-calculator.faq.q4', a: 'gst-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-17',
  },
  {
    slug: 'salary-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'salary-calculator.title',
    h1: 'salary-calculator.h1',
    description: 'salary-calculator.description',
    keywords: ['salary-calculator.keywords'],
    inputs: [
      {
        name: 'amount',
        label: 'salary-calculator.inputs.amount',
        type: 'number',
        min: 1,
        step: 0.01,
        placeholder: '50000',
        defaultValue: 50000,
      },
      {
        name: 'period',
        label: 'salary-calculator.inputs.period',
        type: 'select',
        options: [
          {value: 'hourly', label: 'salary-calculator.options.hourly'},
          {value: 'daily', label: 'salary-calculator.options.daily'},
          {value: 'weekly', label: 'salary-calculator.options.weekly'},
          {value: 'monthly', label: 'salary-calculator.options.monthly'},
          {value: 'yearly', label: 'salary-calculator.options.yearly'},
        ],
        defaultValue: 'monthly',
      },
      {
        name: 'hoursPerWeek',
        label: 'salary-calculator.inputs.hoursPerWeek',
        type: 'number',
        min: 1,
        max: 168,
        step: 1,
        defaultValue: 40,
        hint: 'salary-calculator.hints.hoursPerWeek',
      },
      {
        name: 'daysPerWeek',
        label: 'salary-calculator.inputs.daysPerWeek',
        type: 'number',
        min: 1,
        max: 7,
        step: 1,
        defaultValue: 5,
        hint: 'salary-calculator.hints.daysPerWeek',
      },
    ],
    calculate: ({amount, period, hoursPerWeek, daysPerWeek}) => {
      const A = Number(amount)
      const hpw = Number(hoursPerWeek)
      const dpw = Number(daysPerWeek)

      if (!Number.isFinite(A) || A <= 0) return {value: '—'}

      const weeksPerYear = 52
      const monthsPerYear = 12

      const hoursPerYear = hpw * weeksPerYear
      const daysPerYear = dpw * weeksPerYear

      let yearly: number

      switch (period) {
        case 'hourly':
          yearly = A * hoursPerYear
          break
        case 'daily':
          yearly = A * daysPerYear
          break
        case 'weekly':
          yearly = A * weeksPerYear
          break
        case 'monthly':
          yearly = A * monthsPerYear
          break
        case 'yearly':
          yearly = A
          break
        default:
          return {value: '—'}
      }

      const monthly = yearly / monthsPerYear
      const weekly = yearly / weeksPerYear
      const daily = yearly / daysPerYear
      const hourly = yearly / hoursPerYear

      return {
        value: formatInt(yearly),
        raw: yearly,
        secondary: [
          {
            label: 'salary-calculator.secondary.monthly',
            value: formatInt(monthly),
          },
          {
            label: 'salary-calculator.secondary.weekly',
            value: formatInt(weekly),
          },
          {
            label: 'salary-calculator.secondary.daily',
            value: formatInt(daily),
          },
          {
            label: 'salary-calculator.secondary.hourly',
            value: formatInt(hourly),
          },
        ],
      }
    },
    resultLabel: 'salary-calculator.resultLabel',
    resultUnit: 'salary-calculator.resultUnit',
    faq: [
      {q: 'salary-calculator.faq.q1', a: 'salary-calculator.faq.a1'},
      {q: 'salary-calculator.faq.q2', a: 'salary-calculator.faq.a2'},
      {q: 'salary-calculator.faq.q3', a: 'salary-calculator.faq.a3'},
      {q: 'salary-calculator.faq.q4', a: 'salary-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-17',
  },
  {
    slug: 'roi-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'roi-calculator.title',
    h1: 'roi-calculator.h1',
    description: 'roi-calculator.description',
    keywords: ['roi-calculator.keywords'],
    inputs: [
      {
        name: 'mode',
        label: 'roi-calculator.inputs.mode',
        type: 'select',
        options: [
          {value: 'simple', label: 'roi-calculator.options.simple'},
          {value: 'business', label: 'roi-calculator.options.business'},
        ],
        defaultValue: 'simple',
      },
      {
        name: 'initial',
        label: 'roi-calculator.inputs.initial',
        type: 'slider',
        min: 100,
        max: 1000000,
        step: 100,
        defaultValue: 10000,
      },
      {
        name: 'final',
        label: 'roi-calculator.inputs.final',
        type: 'slider',
        min: 100,
        max: 1000000,
        step: 100,
        defaultValue: 15000,
      },
      {
        name: 'cost',
        label: 'roi-calculator.inputs.cost',
        type: 'slider',
        min: 0,
        max: 500000,
        step: 100,
        defaultValue: 0,
        hint: 'roi-calculator.hints.cost',
      },
    ],
    calculate: ({mode, initial, final, cost}) => {
      const I = Number(initial)
      const F = Number(final)
      const C = Number(cost)

      if (!Number.isFinite(I) || I <= 0) return {value: '—'}

      if (mode === 'business') {
        // cost = затраты, final = выручка
        const revenue = F
        const profit = revenue - C
        const roi = C > 0 ? (profit / C) * 100 : 0
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0

        return {
          value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,
          raw: roi,
          secondary: [
            {
              label: 'roi-calculator.secondary.revenue',
              value: formatInt(revenue),
            },
            {
              label: 'roi-calculator.secondary.cost',
              value: formatInt(C),
            },
            {
              label: 'roi-calculator.secondary.profit',
              value: formatInt(profit),
            },
            {
              label: 'roi-calculator.secondary.margin',
              value: `${margin.toFixed(1)}%`,
            },
          ],
        }
      }

      // simple: I → F
      const profit = F - I
      const roi = (profit / I) * 100

      return {
        value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,
        raw: roi,
        secondary: [
          {
            label: 'roi-calculator.secondary.initial',
            value: formatInt(I),
          },
          {
            label: 'roi-calculator.secondary.final',
            value: formatInt(F),
          },
          {
            label: 'roi-calculator.secondary.profit',
            value: formatInt(profit),
          },
        ],
      }
    },
    resultLabel: 'roi-calculator.resultLabel',
    faq: [
      {q: 'roi-calculator.faq.q1', a: 'roi-calculator.faq.a1'},
      {q: 'roi-calculator.faq.q2', a: 'roi-calculator.faq.a2'},
      {q: 'roi-calculator.faq.q3', a: 'roi-calculator.faq.a3'},
      {q: 'roi-calculator.faq.q4', a: 'roi-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-17',
  },
  {
    slug: 'sip-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'sip-calculator.title',
    h1: 'sip-calculator.h1',
    description: 'sip-calculator.description',
    keywords: ['sip-calculator.keywords'],
    inputs: [
      {
        name: 'monthly',
        label: 'sip-calculator.inputs.monthly',
        type: 'slider',
        min: 500,
        max: 100000,
        step: 500,
        defaultValue: 5000,
      },
      {
        name: 'rate',
        label: 'sip-calculator.inputs.rate',
        type: 'slider',
        min: 1,
        max: 30,
        step: 0.5,
        defaultValue: 12,
      },
      {
        name: 'years',
        label: 'sip-calculator.inputs.years',
        type: 'slider',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 10,
      },
    ],
    calculate: ({monthly, rate, years}) => {
      const P = Number(monthly)
      const annualRate = Number(rate)
      const y = Number(years)

      if (!Number.isFinite(P) || P <= 0) return {value: '—'}
      if (!Number.isFinite(y) || y <= 0) return {value: '—'}

      const n = Math.round(y * 12)
      const i = annualRate / 12 / 100

      let fv: number
      if (i === 0) {
        fv = P * n
      } else {
        const pow = (1 + i) ** n
        fv = P * ((pow - 1) / i) * (1 + i)
      }

      const invested = P * n
      const gains = fv - invested
      const gainShare = (gains / fv) * 100

      return {
        value: formatInt(fv),
        raw: fv,
        secondary: [
          {
            label: 'sip-calculator.secondary.invested',
            value: formatInt(invested),
          },
          {
            label: 'sip-calculator.secondary.gains',
            value: formatInt(gains),
          },
          {
            label: 'sip-calculator.secondary.months',
            value: String(n),
          },
          {
            label: 'sip-calculator.secondary.gainShare',
            value: `${gainShare.toFixed(1)}%`,
          },
        ],
      }
    },
    resultLabel: 'sip-calculator.resultLabel',
    faq: [
      {q: 'sip-calculator.faq.q1', a: 'sip-calculator.faq.a1'},
      {q: 'sip-calculator.faq.q2', a: 'sip-calculator.faq.a2'},
      {q: 'sip-calculator.faq.q3', a: 'sip-calculator.faq.a3'},
      {q: 'sip-calculator.faq.q4', a: 'sip-calculator.faq.a4'},
    ],
    publishedAt: '2025-01-17',
  },
  {
    slug: 'date-difference-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'date-difference-calculator.title',
    h1: 'date-difference-calculator.h1',
    description: 'date-difference-calculator.description',
    keywords: ['date-difference-calculator.keywords'],
    inputs: [
      {
        name: 'startDate',
        label: 'date-difference-calculator.inputs.startDate',
        type: 'date',
      },
      {
        name: 'endDate',
        label: 'date-difference-calculator.inputs.endDate',
        type: 'date',
        hint: 'date-difference-calculator.hints.endDate',
      },
    ],
    calculate: ({startDate, endDate}) => {
      if (!startDate) return {value: '—'}

      const start = new Date(String(startDate))
      const end = endDate ? new Date(String(endDate)) : new Date()

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return {value: '—'}
      }

      const [from, to] = start <= end ? [start, end] : [end, start]

      let years = to.getFullYear() - from.getFullYear()
      let months = to.getMonth() - from.getMonth()
      let days = to.getDate() - from.getDate()

      if (days < 0) {
        months--
        const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0)
        days += prevMonth.getDate()
      }
      if (months < 0) {
        years--
        months += 12
      }

      const msPerDay = 1000 * 60 * 60 * 24
      const totalDays = Math.round((to.getTime() - from.getTime()) / msPerDay)
      const totalWeeks = Math.floor(totalDays / 7)
      const totalMonths = years * 12 + months

      return {
        value: String(totalDays),
        raw: totalDays,
        secondary: [
          {
            label: 'date-difference-calculator.secondary.years',
            value: String(years),
          },
          {
            label: 'date-difference-calculator.secondary.months',
            value: String(months),
          },
          {
            label: 'date-difference-calculator.secondary.days',
            value: String(days),
          },
          {
            label: 'date-difference-calculator.secondary.totalWeeks',
            value: totalWeeks.toLocaleString('en-US'),
          },
          {
            label: 'date-difference-calculator.secondary.totalMonths',
            value: String(totalMonths),
          },
        ],
      }
    },
    resultLabel: 'date-difference-calculator.resultLabel',
    resultUnit: 'date-difference-calculator.resultUnit',
    faq: [
      {
        q: 'date-difference-calculator.faq.q1',
        a: 'date-difference-calculator.faq.a1',
      },
      {
        q: 'date-difference-calculator.faq.q2',
        a: 'date-difference-calculator.faq.a2',
      },
      {
        q: 'date-difference-calculator.faq.q3',
        a: 'date-difference-calculator.faq.a3',
      },
      {
        q: 'date-difference-calculator.faq.q4',
        a: 'date-difference-calculator.faq.a4',
      },
    ],
    publishedAt: '2025-01-17',
  },
]
