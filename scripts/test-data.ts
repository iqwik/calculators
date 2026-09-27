import {runCalculation} from '@/helpers'
import {allCalculators, getCalculator, getRelated} from '../data'

console.info(`Всего калькуляторов: ${allCalculators.length}`)

const bmi = getCalculator('health', 'bmi-calculator')
if (!bmi) throw new Error('BMI не найден')

const result = runCalculation(bmi, {height: 175, weight: 70})
console.info('BMI результат:', result)

const related = getRelated(bmi.related ?? [])
console.info(
  'Связанные:',
  related.map(c => c.slug),
)
