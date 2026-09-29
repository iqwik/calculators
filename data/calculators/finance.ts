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

function calcOldRegimeTax(taxable: number): number {
  if (taxable <= 250000) return 0
  if (taxable <= 500000) return (taxable - 250000) * 0.05
  if (taxable <= 1000000) return 12500 + (taxable - 500000) * 0.2
  return 112500 + (taxable - 1000000) * 0.3
}

function calcNewRegimeTax(taxable: number): number {
  if (taxable <= 400000) return 0
  if (taxable <= 800000) return (taxable - 400000) * 0.05
  if (taxable <= 1200000) return 20000 + (taxable - 800000) * 0.1
  if (taxable <= 1600000) return 60000 + (taxable - 1200000) * 0.15
  if (taxable <= 2000000) return 120000 + (taxable - 1600000) * 0.2
  if (taxable <= 2400000) return 200000 + (taxable - 2000000) * 0.25
  return 300000 + (taxable - 2400000) * 0.3
}

function formatINR(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

// ─── Rent vs Buy ─────────────────────────────────────────

const PROPERTY_ANNUAL_COST_RATE = 0.02 // 2% of home value per year (tax + insurance + maintenance)

interface RentVsBuyResult {
  buyFinal: number
  rentFinal: number
  buyTotalPaid: number
  rentTotalPaid: number
  recommendation: 'buy' | 'rent' | 'tie'
}

function computeRentVsBuy(
  price: number,
  downPayment: number,
  mortgageRate: number,
  mortgageTerm: number,
  rentMonthly: number,
  appreciation: number,
  rentGrowth: number,
  investmentReturn: number,
  years: number,
): RentVsBuyResult {
  const months = Math.round(years * 12)
  const i = mortgageRate / 12 / 100
  const loanAmount = Math.max(0, price - downPayment)
  const mortgageMonths = Math.round(mortgageTerm * 12)

  // Monthly mortgage payment (annuity)
  let monthlyMortgage: number
  if (loanAmount === 0) {
    monthlyMortgage = 0
  } else if (i === 0) {
    monthlyMortgage = loanAmount / mortgageMonths
  } else {
    const pow = (1 + i) ** mortgageMonths
    monthlyMortgage = (loanAmount * i * pow) / (pow - 1)
  }

  // ─── Scenario: Buy ───
  let homeValue = price
  let mortgageBalance = loanAmount
  let buyTotalPaid = downPayment

  for (let m = 1; m <= months; m++) {
    // Pay mortgage (if still active)
    if (m <= mortgageMonths && mortgageBalance > 0) {
      const interest = mortgageBalance * i
      const principal = monthlyMortgage - interest
      mortgageBalance = Math.max(0, mortgageBalance - principal)
      buyTotalPaid += monthlyMortgage
    }

    // Annual property costs (paid monthly pro-rata)
    buyTotalPaid += (homeValue * PROPERTY_ANNUAL_COST_RATE) / 12

    // Home appreciation — apply monthly
    homeValue *= 1 + appreciation / 100 / 12
  }

  const buyEquity = homeValue - mortgageBalance

  // ─── Scenario: Rent & Invest ───
  // Renter invests: down payment + (buy monthly cost − rent) each month
  // We need to compute the monthly "buy cost" at each point to know the delta.

  const monthlyInvestmentRate = investmentReturn / 100 / 12

  let rentValue = rentMonthly
  let rentTotalPaid = 0
  let portfolio = downPayment // Down payment invested instead

  // Recompute buy monthly cost at each point in parallel
  let homeValueForComparison = price
  let mortgageBalanceForComparison = loanAmount

  for (let m = 1; m <= months; m++) {
    // Buy cost this month
    let buyMonthlyCost = 0
    if (m <= mortgageMonths && mortgageBalanceForComparison > 0) {
      const interest = mortgageBalanceForComparison * i
      const principal = monthlyMortgage - interest
      mortgageBalanceForComparison = Math.max(
        0,
        mortgageBalanceForComparison - principal,
      )
      buyMonthlyCost += monthlyMortgage
    }
    buyMonthlyCost += (homeValueForComparison * PROPERTY_ANNUAL_COST_RATE) / 12
    homeValueForComparison *= 1 + appreciation / 100 / 12

    // Renter pays rent
    rentTotalPaid += rentValue

    // Difference goes into (or out of) the investment portfolio
    const delta = buyMonthlyCost - rentValue

    // Grow the portfolio
    portfolio *= 1 + monthlyInvestmentRate
    portfolio += delta

    // Rent grows annually
    if (m % 12 === 0) {
      rentValue *= 1 + rentGrowth / 100
    }
  }

  const rentFinal = portfolio

  let recommendation: 'buy' | 'rent' | 'tie'
  const diff = buyEquity - rentFinal
  const threshold = Math.max(1000, price * 0.01) // 1% of home price
  if (Math.abs(diff) < threshold) recommendation = 'tie'
  else if (diff > 0) recommendation = 'buy'
  else recommendation = 'rent'

  return {
    buyFinal: buyEquity,
    rentFinal,
    buyTotalPaid,
    rentTotalPaid,
    recommendation,
  }
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
    slug: 'loan-payment-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'loan-payment-calculator.title',
    h1: 'loan-payment-calculator.h1',
    description: 'loan-payment-calculator.description',
    keywords: ['loan-payment-calculator.keywords'],
    inputs: [
      {
        name: 'principal',
        label: 'loan-payment-calculator.inputs.principal',
        type: 'slider',
        min: 1000,
        max: 100000000,
        step: 1000,
        placeholder: '500000',
        defaultValue: 500000,
      },
      {
        name: 'rate',
        label: 'loan-payment-calculator.inputs.rate',
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
        label: 'loan-payment-calculator.inputs.tenure',
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
            label: 'loan-payment-calculator.secondary.principal',
            value: formatInt(P),
          },
          {
            label: 'loan-payment-calculator.secondary.totalInterest',
            value: formatInt(totalInterest),
          },
          {
            label: 'loan-payment-calculator.secondary.totalPayment',
            value: formatInt(totalPayment),
          },
          {
            label: 'loan-payment-calculator.secondary.months',
            value: String(n),
          },
          {
            label: 'loan-payment-calculator.secondary.interestShare',
            value: `${interestShare.toFixed(1)}%`,
          },
        ],
      }
    },
    resultLabel: 'loan-payment-calculator.resultLabel',
    resultUnit: 'loan-payment-calculator.resultUnit',
    faq: [
      {
        q: 'loan-payment-calculator.faq.q1',
        a: 'loan-payment-calculator.faq.a1',
      },
      {
        q: 'loan-payment-calculator.faq.q2',
        a: 'loan-payment-calculator.faq.a2',
      },
      {
        q: 'loan-payment-calculator.faq.q3',
        a: 'loan-payment-calculator.faq.a3',
      },
      {
        q: 'loan-payment-calculator.faq.q4',
        a: 'loan-payment-calculator.faq.a4',
      },
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
    slug: 'sales-tax-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'sales-tax-calculator.title',
    h1: 'sales-tax-calculator.h1',
    description: 'sales-tax-calculator.description',
    keywords: ['sales-tax-calculator.keywords'],
    inputs: [
      {
        name: 'amount',
        label: 'sales-tax-calculator.inputs.amount',
        type: 'slider',
        min: 1,
        max: 1000000,
        step: 100,
        defaultValue: 100,
      },
      {
        name: 'rate',
        label: 'sales-tax-calculator.inputs.rate',
        type: 'select',
        options: [
          {value: '5', label: 'sales-tax-calculator.options.r5'},
          {value: '10', label: 'sales-tax-calculator.options.r10'},
          {value: '15', label: 'sales-tax-calculator.options.r15'},
          {value: '20', label: 'sales-tax-calculator.options.r20'},
          {value: '25', label: 'sales-tax-calculator.options.r25'},
        ],
        defaultValue: '20',
      },
      {
        name: 'type',
        label: 'sales-tax-calculator.inputs.type',
        type: 'select',
        options: [
          {value: 'exclusive', label: 'sales-tax-calculator.options.exclusive'},
          {value: 'inclusive', label: 'sales-tax-calculator.options.inclusive'},
        ],
        defaultValue: 'exclusive',
      },
    ],
    calculate: ({amount, rate, type}) => {
      const A = Number(amount)
      const r = Number(rate)

      if (!Number.isFinite(A) || A <= 0) return {value: '—'}

      let base: number
      let tax: number
      let gross: number

      if (type === 'exclusive') {
        base = A
        tax = (A * r) / 100
        gross = A + tax
      } else {
        base = A / (1 + r / 100)
        tax = A - base
        gross = A
      }

      return {
        value: formatInt(gross),
        raw: gross,
        secondary: [
          {
            label: 'sales-tax-calculator.secondary.base',
            value: formatInt(base),
          },
          {
            label: 'sales-tax-calculator.secondary.tax',
            value: formatInt(tax),
          },
          {
            label: 'sales-tax-calculator.secondary.rate',
            value: `${r}%`,
          },
          {
            label: 'sales-tax-calculator.secondary.gross',
            value: formatInt(gross),
          },
        ],
      }
    },
    resultLabel: 'sales-tax-calculator.resultLabel',
    faq: [
      {q: 'sales-tax-calculator.faq.q1', a: 'sales-tax-calculator.faq.a1'},
      {q: 'sales-tax-calculator.faq.q2', a: 'sales-tax-calculator.faq.a2'},
      {q: 'sales-tax-calculator.faq.q3', a: 'sales-tax-calculator.faq.a3'},
      {q: 'sales-tax-calculator.faq.q4', a: 'sales-tax-calculator.faq.a4'},
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
    slug: 'monthly-investment-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'monthly-investment-calculator.title',
    h1: 'monthly-investment-calculator.h1',
    description: 'monthly-investment-calculator.description',
    keywords: ['monthly-investment-calculator.keywords'],
    inputs: [
      {
        name: 'monthly',
        label: 'monthly-investment-calculator.inputs.monthly',
        type: 'slider',
        min: 500,
        max: 100000,
        step: 500,
        defaultValue: 5000,
      },
      {
        name: 'rate',
        label: 'monthly-investment-calculator.inputs.rate',
        type: 'slider',
        min: 1,
        max: 30,
        step: 0.5,
        defaultValue: 12,
      },
      {
        name: 'years',
        label: 'monthly-investment-calculator.inputs.years',
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
            label: 'monthly-investment-calculator.secondary.invested',
            value: formatInt(invested),
          },
          {
            label: 'monthly-investment-calculator.secondary.gains',
            value: formatInt(gains),
          },
          {
            label: 'monthly-investment-calculator.secondary.months',
            value: String(n),
          },
          {
            label: 'monthly-investment-calculator.secondary.gainShare',
            value: `${gainShare.toFixed(1)}%`,
          },
        ],
      }
    },
    resultLabel: 'monthly-investment-calculator.resultLabel',
    faq: [
      {
        q: 'monthly-investment-calculator.faq.q1',
        a: 'monthly-investment-calculator.faq.a1',
      },
      {
        q: 'monthly-investment-calculator.faq.q2',
        a: 'monthly-investment-calculator.faq.a2',
      },
      {
        q: 'monthly-investment-calculator.faq.q3',
        a: 'monthly-investment-calculator.faq.a3',
      },
      {
        q: 'monthly-investment-calculator.faq.q4',
        a: 'monthly-investment-calculator.faq.a4',
      },
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
  {
    slug: 'tax-regime-comparator',
    category: 'finance',
    tags: ['calculator'],
    title: 'tax-regime-comparator.title',
    h1: 'tax-regime-comparator.h1',
    description: 'tax-regime-comparator.description',
    keywords: ['tax-regime-comparator.keywords'],
    inputs: [
      {
        name: 'annualIncome',
        label: 'tax-regime-comparator.inputs.annualIncome',
        type: 'slider',
        min: 300000,
        max: 10000000,
        step: 50000,
        defaultValue: 1200000,
        hint: 'tax-regime-comparator.hints.annualIncome',
      },
      {
        name: 'deductions',
        label: 'tax-regime-comparator.inputs.deductions',
        type: 'slider',
        min: 0,
        max: 500000,
        step: 5000,
        defaultValue: 150000,
        hint: 'tax-regime-comparator.hints.deductions',
      },
    ],
    calculate: ({annualIncome, deductions}) => {
      const income = Number(annualIncome)
      const ded = Number(deductions)

      if (!Number.isFinite(income) || income <= 0) return {value: '—'}

      // --- New Regime ---
      const newStdDed = 75000
      const newTaxable = Math.max(0, income - newStdDed)
      const newTaxBeforeRebate = calcNewRegimeTax(newTaxable)
      const newRebate = newTaxable <= 700000 ? newTaxBeforeRebate : 0
      const newTaxAfterRebate = Math.max(0, newTaxBeforeRebate - newRebate)
      const newTax = Math.round(newTaxAfterRebate * 1.04)

      // --- Old Regime ---
      const oldStdDed = 50000
      const oldTaxable = Math.max(0, income - oldStdDed - ded)
      const oldTaxBeforeRebate = calcOldRegimeTax(oldTaxable)
      const oldRebate = oldTaxable <= 500000 ? oldTaxBeforeRebate : 0
      const oldTaxAfterRebate = Math.max(0, oldTaxBeforeRebate - oldRebate)
      const oldTax = Math.round(oldTaxAfterRebate * 1.04)

      const savings = Math.abs(oldTax - newTax)
      let better: 'old' | 'new' | 'same'
      if (oldTax < newTax) better = 'old'
      else if (newTax < oldTax) better = 'new'
      else better = 'same'

      return {
        value: formatINR(savings),
        raw: savings,
        secondary: [
          {
            label: 'tax-regime-comparator.secondary.recommended',
            value:
              better === 'new'
                ? 'tax-regime-comparator.recommendation.new'
                : better === 'old'
                  ? 'tax-regime-comparator.recommendation.old'
                  : 'tax-regime-comparator.recommendation.same',
          },
          {
            label: 'tax-regime-comparator.secondary.oldTax',
            value: formatINR(oldTax),
          },
          {
            label: 'tax-regime-comparator.secondary.newTax',
            value: formatINR(newTax),
          },
          {
            label: 'tax-regime-comparator.secondary.oldTaxable',
            value: formatINR(oldTaxable),
          },
          {
            label: 'tax-regime-comparator.secondary.newTaxable',
            value: formatINR(newTaxable),
          },
        ],
      }
    },
    resultLabel: 'tax-regime-comparator.resultLabel',
    resultUnit: 'tax-regime-comparator.resultUnit',
    faq: [
      {q: 'tax-regime-comparator.faq.q1', a: 'tax-regime-comparator.faq.a1'},
      {q: 'tax-regime-comparator.faq.q2', a: 'tax-regime-comparator.faq.a2'},
      {q: 'tax-regime-comparator.faq.q3', a: 'tax-regime-comparator.faq.a3'},
      {q: 'tax-regime-comparator.faq.q4', a: 'tax-regime-comparator.faq.a4'},
    ],
    related: ['loan-payment-calculator', 'monthly-investment-calculator'],
    publishedAt: '2026-09-29',
  },
  {
    slug: 'savings-goal-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'savings-goal-calculator.title',
    h1: 'savings-goal-calculator.h1',
    description: 'savings-goal-calculator.description',
    keywords: ['savings-goal-calculator.keywords'],
    inputs: [
      {
        name: 'goal',
        label: 'savings-goal-calculator.inputs.goal',
        type: 'slider',
        min: 1000,
        max: 10000000,
        step: 1000,
        defaultValue: 1000000,
      },
      {
        name: 'initial',
        label: 'savings-goal-calculator.inputs.initial',
        type: 'slider',
        min: 0,
        max: 1000000,
        step: 1000,
        defaultValue: 0,
        hint: 'savings-goal-calculator.hints.initial',
      },
      {
        name: 'rate',
        label: 'savings-goal-calculator.inputs.rate',
        type: 'slider',
        min: 0,
        max: 30,
        step: 0.5,
        defaultValue: 7,
      },
      {
        name: 'years',
        label: 'savings-goal-calculator.inputs.years',
        type: 'slider',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 10,
      },
    ],
    calculate: ({goal, initial, rate, years}) => {
      const FV = Number(goal)
      const PV = Number(initial)
      const annualRate = Number(rate)
      const y = Number(years)

      if (!Number.isFinite(FV) || FV <= 0) return {value: '—'}
      if (!Number.isFinite(PV) || PV < 0) return {value: '—'}
      if (!Number.isFinite(y) || y <= 0) return {value: '—'}

      const n = Math.round(y * 12)
      const i = annualRate / 12 / 100

      // FV of initial lump sum
      const fvInitial = PV * (1 + i) ** n

      // Remaining amount to accumulate via monthly contributions
      const remaining = FV - fvInitial

      if (remaining <= 0) {
        // Initial lump sum is enough
        return {
          value: '0',
          raw: 0,
          secondary: [
            {
              label: 'savings-goal-calculator.secondary.initial',
              value: formatInt(PV),
            },
            {
              label: 'savings-goal-calculator.secondary.fvInitial',
              value: formatInt(fvInitial),
            },
            {
              label: 'savings-goal-calculator.secondary.totalInvested',
              value: formatInt(PV),
            },
            {
              label: 'savings-goal-calculator.secondary.interest',
              value: formatInt(fvInitial - PV),
            },
          ],
        }
      }

      // PMT (annuity due — contributions at the start of each month)
      let pmt: number
      if (i === 0) {
        pmt = remaining / n
      } else {
        const pow = (1 + i) ** n
        pmt = (remaining * i) / (pow - 1) / (1 + i)
      }

      const totalContributions = pmt * n
      const totalInvested = PV + totalContributions
      const interest = FV - totalInvested

      return {
        value: formatInt(pmt),
        raw: pmt,
        secondary: [
          {
            label: 'savings-goal-calculator.secondary.initial',
            value: formatInt(PV),
          },
          {
            label: 'savings-goal-calculator.secondary.totalContributions',
            value: formatInt(totalContributions),
          },
          {
            label: 'savings-goal-calculator.secondary.totalInvested',
            value: formatInt(totalInvested),
          },
          {
            label: 'savings-goal-calculator.secondary.interest',
            value: formatInt(interest),
          },
        ],
      }
    },
    resultLabel: 'savings-goal-calculator.resultLabel',
    resultUnit: 'savings-goal-calculator.resultUnit',
    faq: [
      {
        q: 'savings-goal-calculator.faq.q1',
        a: 'savings-goal-calculator.faq.a1',
      },
      {
        q: 'savings-goal-calculator.faq.q2',
        a: 'savings-goal-calculator.faq.a2',
      },
      {
        q: 'savings-goal-calculator.faq.q3',
        a: 'savings-goal-calculator.faq.a3',
      },
      {
        q: 'savings-goal-calculator.faq.q4',
        a: 'savings-goal-calculator.faq.a4',
      },
    ],
    related: ['monthly-investment-calculator', 'compound-interest-calculator'],
    publishedAt: '2026-09-29',
  },
  {
    slug: 'loan-eligibility-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'loan-eligibility-calculator.title',
    h1: 'loan-eligibility-calculator.h1',
    description: 'loan-eligibility-calculator.description',
    keywords: ['loan-eligibility-calculator.keywords'],
    inputs: [
      {
        name: 'monthlyIncome',
        label: 'loan-eligibility-calculator.inputs.monthlyIncome',
        type: 'slider',
        min: 500,
        max: 50000,
        step: 100,
        defaultValue: 5000,
      },
      {
        name: 'existingDebt',
        label: 'loan-eligibility-calculator.inputs.existingDebt',
        type: 'slider',
        min: 0,
        max: 10000,
        step: 50,
        defaultValue: 500,
      },
      {
        name: 'dtiLimit',
        label: 'loan-eligibility-calculator.inputs.dtiLimit',
        type: 'slider',
        min: 10,
        max: 60,
        step: 1,
        unit: '%',
        defaultValue: 40,
        hint: 'loan-eligibility-calculator.hints.dtiLimit',
      },
      {
        name: 'rate',
        label: 'loan-eligibility-calculator.inputs.rate',
        type: 'slider',
        min: 0,
        max: 30,
        step: 0.1,
        unit: '%',
        defaultValue: 6,
      },
      {
        name: 'tenure',
        label: 'loan-eligibility-calculator.inputs.tenure',
        type: 'slider',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 30,
      },
    ],
    calculate: ({monthlyIncome, existingDebt, dtiLimit, rate, tenure}) => {
      const income = Number(monthlyIncome)
      const debt = Number(existingDebt)
      const dti = Number(dtiLimit)
      const annualRate = Number(rate)
      const years = Number(tenure)

      if (!Number.isFinite(income) || income <= 0) return {value: '—'}
      if (!Number.isFinite(dti) || dti <= 0) return {value: '—'}
      if (!Number.isFinite(years) || years <= 0) return {value: '—'}

      const maxTotalDebt = (income * dti) / 100
      const availableForNewLoan = maxTotalDebt - debt

      if (availableForNewLoan <= 0) {
        return {
          value: '0',
          raw: 0,
          secondary: [
            {
              label: 'loan-eligibility-calculator.secondary.maxTotalDebt',
              value: formatInt(maxTotalDebt),
            },
            {
              label: 'loan-eligibility-calculator.secondary.existingDebt',
              value: formatInt(debt),
            },
            {
              label: 'loan-eligibility-calculator.secondary.availablePayment',
              value: '0',
            },
          ],
        }
      }

      const n = Math.round(years * 12)
      const i = annualRate / 12 / 100

      let maxLoan: number
      if (i === 0) {
        maxLoan = availableForNewLoan * n
      } else {
        const pow = (1 + i) ** n
        maxLoan = (availableForNewLoan * (pow - 1)) / (i * pow)
      }

      const totalPayment = availableForNewLoan * n
      const totalInterest = totalPayment - maxLoan

      return {
        value: formatInt(maxLoan),
        raw: maxLoan,
        secondary: [
          {
            label: 'loan-eligibility-calculator.secondary.availablePayment',
            value: formatInt(availableForNewLoan),
          },
          {
            label: 'loan-eligibility-calculator.secondary.maxTotalDebt',
            value: formatInt(maxTotalDebt),
          },
          {
            label: 'loan-eligibility-calculator.secondary.totalInterest',
            value: formatInt(totalInterest),
          },
          {
            label: 'loan-eligibility-calculator.secondary.totalPayment',
            value: formatInt(totalPayment),
          },
          {
            label: 'loan-eligibility-calculator.secondary.months',
            value: String(n),
          },
        ],
      }
    },
    resultLabel: 'loan-eligibility-calculator.resultLabel',
    faq: [
      {
        q: 'loan-eligibility-calculator.faq.q1',
        a: 'loan-eligibility-calculator.faq.a1',
      },
      {
        q: 'loan-eligibility-calculator.faq.q2',
        a: 'loan-eligibility-calculator.faq.a2',
      },
      {
        q: 'loan-eligibility-calculator.faq.q3',
        a: 'loan-eligibility-calculator.faq.a3',
      },
      {
        q: 'loan-eligibility-calculator.faq.q4',
        a: 'loan-eligibility-calculator.faq.a4',
      },
    ],
    related: ['loan-payment-calculator', 'savings-goal-calculator'],
    publishedAt: '2026-09-29',
  },
  {
    slug: 'rent-vs-buy-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'rent-vs-buy-calculator.title',
    h1: 'rent-vs-buy-calculator.h1',
    description: 'rent-vs-buy-calculator.description',
    keywords: ['rent-vs-buy-calculator.keywords'],
    inputs: [
      {
        name: 'price',
        label: 'rent-vs-buy-calculator.inputs.price',
        type: 'slider',
        min: 50000,
        max: 2000000,
        step: 10000,
        defaultValue: 400000,
      },
      {
        name: 'downPayment',
        label: 'rent-vs-buy-calculator.inputs.downPayment',
        type: 'slider',
        min: 0,
        max: 500000,
        step: 5000,
        defaultValue: 80000,
        hint: 'rent-vs-buy-calculator.hints.downPayment',
      },
      {
        name: 'mortgageRate',
        label: 'rent-vs-buy-calculator.inputs.mortgageRate',
        type: 'slider',
        min: 0,
        max: 20,
        step: 0.1,
        unit: '%',
        defaultValue: 6,
      },
      {
        name: 'mortgageTerm',
        label: 'rent-vs-buy-calculator.inputs.mortgageTerm',
        type: 'slider',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 30,
      },
      {
        name: 'rentMonthly',
        label: 'rent-vs-buy-calculator.inputs.rentMonthly',
        type: 'slider',
        min: 100,
        max: 10000,
        step: 50,
        defaultValue: 1500,
      },
      {
        name: 'appreciation',
        label: 'rent-vs-buy-calculator.inputs.appreciation',
        type: 'slider',
        min: -5,
        max: 15,
        step: 0.5,
        unit: '%',
        defaultValue: 3,
        hint: 'rent-vs-buy-calculator.hints.appreciation',
      },
      {
        name: 'rentGrowth',
        label: 'rent-vs-buy-calculator.inputs.rentGrowth',
        type: 'slider',
        min: 0,
        max: 15,
        step: 0.5,
        unit: '%',
        defaultValue: 2,
      },
      {
        name: 'investmentReturn',
        label: 'rent-vs-buy-calculator.inputs.investmentReturn',
        type: 'slider',
        min: 0,
        max: 15,
        step: 0.5,
        unit: '%',
        defaultValue: 7,
        hint: 'rent-vs-buy-calculator.hints.investmentReturn',
      },
      {
        name: 'years',
        label: 'rent-vs-buy-calculator.inputs.years',
        type: 'slider',
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 10,
      },
    ],
    calculate: ({
      price,
      downPayment,
      mortgageRate,
      mortgageTerm,
      rentMonthly,
      appreciation,
      rentGrowth,
      investmentReturn,
      years,
    }) => {
      const P = Number(price)
      const DP = Number(downPayment)
      const MR = Number(mortgageRate)
      const MT = Number(mortgageTerm)
      const RM = Number(rentMonthly)
      const AP = Number(appreciation)
      const RG = Number(rentGrowth)
      const IR = Number(investmentReturn)
      const Y = Number(years)

      if (!Number.isFinite(P) || P <= 0) return {value: '—'}
      if (!Number.isFinite(DP) || DP < 0 || DP > P) return {value: '—'}
      if (!Number.isFinite(Y) || Y <= 0) return {value: '—'}

      const result = computeRentVsBuy(P, DP, MR, MT, RM, AP, RG, IR, Y)

      const diff = result.buyFinal - result.rentFinal
      const sign = diff >= 0 ? '+' : '−'
      const recommendation =
        result.recommendation === 'buy'
          ? 'rent-vs-buy-calculator.recommendation.buy'
          : result.recommendation === 'rent'
            ? 'rent-vs-buy-calculator.recommendation.rent'
            : 'rent-vs-buy-calculator.recommendation.tie'

      return {
        value: `${sign}${formatInt(Math.abs(diff))}`,
        raw: diff,
        secondary: [
          {
            label: 'rent-vs-buy-calculator.secondary.recommendation',
            value: recommendation,
          },
          {
            label: 'rent-vs-buy-calculator.secondary.buyFinal',
            value: formatInt(result.buyFinal),
          },
          {
            label: 'rent-vs-buy-calculator.secondary.rentFinal',
            value: formatInt(result.rentFinal),
          },
          {
            label: 'rent-vs-buy-calculator.secondary.buyTotalPaid',
            value: formatInt(result.buyTotalPaid),
          },
          {
            label: 'rent-vs-buy-calculator.secondary.rentTotalPaid',
            value: formatInt(result.rentTotalPaid),
          },
        ],
      }
    },
    resultLabel: 'rent-vs-buy-calculator.resultLabel',
    resultUnit: 'rent-vs-buy-calculator.resultUnit',
    faq: [
      {
        q: 'rent-vs-buy-calculator.faq.q1',
        a: 'rent-vs-buy-calculator.faq.a1',
      },
      {
        q: 'rent-vs-buy-calculator.faq.q2',
        a: 'rent-vs-buy-calculator.faq.a2',
      },
      {
        q: 'rent-vs-buy-calculator.faq.q3',
        a: 'rent-vs-buy-calculator.faq.a3',
      },
      {
        q: 'rent-vs-buy-calculator.faq.q4',
        a: 'rent-vs-buy-calculator.faq.a4',
      },
    ],
    related: ['loan-payment-calculator', 'savings-goal-calculator'],
    publishedAt: '2026-09-29',
  },
  {
    slug: 'fixed-deposit-calculator',
    category: 'finance',
    tags: ['calculator'],
    title: 'fixed-deposit-calculator.title',
    h1: 'fixed-deposit-calculator.h1',
    description: 'fixed-deposit-calculator.description',
    keywords: ['fixed-deposit-calculator.keywords'],
    inputs: [
      {
        name: 'principal',
        label: 'fixed-deposit-calculator.inputs.principal',
        type: 'slider',
        min: 1000,
        max: 10000000,
        step: 1000,
        defaultValue: 100000,
      },
      {
        name: 'rate',
        label: 'fixed-deposit-calculator.inputs.rate',
        type: 'slider',
        min: 0.1,
        max: 30,
        step: 0.1,
        unit: '%',
        defaultValue: 5,
      },
      {
        name: 'years',
        label: 'fixed-deposit-calculator.inputs.years',
        type: 'slider',
        min: 0.5,
        max: 30,
        step: 0.5,
        defaultValue: 5,
      },
      {
        name: 'frequency',
        label: 'fixed-deposit-calculator.inputs.frequency',
        type: 'select',
        options: [
          {
            value: '12',
            label: 'fixed-deposit-calculator.options.monthly',
          },
          {
            value: '4',
            label: 'fixed-deposit-calculator.options.quarterly',
          },
          {
            value: '2',
            label: 'fixed-deposit-calculator.options.semiannually',
          },
          {
            value: '1',
            label: 'fixed-deposit-calculator.options.annually',
          },
          {
            value: '365',
            label: 'fixed-deposit-calculator.options.daily',
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
      if (!Number.isFinite(r) || r < 0) return {value: '—'}
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
            label: 'fixed-deposit-calculator.secondary.principal',
            value: formatInt(P),
          },
          {
            label: 'fixed-deposit-calculator.secondary.interest',
            value: formatInt(interest),
          },
          {
            label: 'fixed-deposit-calculator.secondary.ear',
            value: `${ear.toFixed(2)}%`,
          },
          {
            label: 'fixed-deposit-calculator.secondary.periods',
            value: String(periods),
          },
        ],
      }
    },
    resultLabel: 'fixed-deposit-calculator.resultLabel',
    faq: [
      {
        q: 'fixed-deposit-calculator.faq.q1',
        a: 'fixed-deposit-calculator.faq.a1',
      },
      {
        q: 'fixed-deposit-calculator.faq.q2',
        a: 'fixed-deposit-calculator.faq.a2',
      },
      {
        q: 'fixed-deposit-calculator.faq.q3',
        a: 'fixed-deposit-calculator.faq.a3',
      },
      {
        q: 'fixed-deposit-calculator.faq.q4',
        a: 'fixed-deposit-calculator.faq.a4',
      },
    ],
    related: ['compound-interest-calculator', 'savings-goal-calculator'],
    publishedAt: '2026-09-29',
  },
]
