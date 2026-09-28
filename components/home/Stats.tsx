import {useTranslations} from 'next-intl'
import {getAllRegistryEntries} from '@/data'

export function Stats() {
  const t = useTranslations('home')
  const count = getAllRegistryEntries().length

  const items = [
    {value: t('stats.tools.value', {count}), label: t('stats.tools.label')},
    {value: t('stats.cost.value'), label: t('stats.cost.label')},
    {value: t('stats.signup.value'), label: t('stats.signup.label')},
    {value: t('stats.speed.value'), label: t('stats.speed.label')},
  ]

  return (
    <section className="border-y bg-card">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-2 py-2 text-center sm:grid-cols-4">
        {items.map(item => (
          <div key={item.label}>
            <div className="text-2xl font-extrabold">{item.value}</div>
            <div className="mt-1 text-xs font-medium tracking-wide text-muted-foreground">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
