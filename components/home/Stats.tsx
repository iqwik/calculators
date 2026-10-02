import {useTranslations} from 'next-intl'
import {getAllRegistryEntries} from '@/data'

export function Stats() {
  const t = useTranslations('home')
  const count = getAllRegistryEntries().length

  const items = [
    {
      value: t('stats.tools.value', {count}),
      label: t('stats.tools.label').toLowerCase(),
    },
    {value: t('stats.cost.value'), label: t('stats.cost.label').toLowerCase()},
    {
      value: t('stats.signup.value'),
      label: t('stats.signup.label').toLowerCase(),
    },
    {
      value: t('stats.speed.value'),
      label: t('stats.speed.label').toLowerCase(),
    },
  ]

  return (
    <div className="flex gap-3 m-auto py-4">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-1 text-xs">
          <span className="font-extrabold">{item.value}</span>
          <span className="font-medium tracking-wide text-muted-foreground">
            {item.label}
          </span>
          {i < items.length - 1 && (
            <span className="text-muted-foreground/50 ml-2">•</span>
          )}
        </div>
      ))}
    </div>
  )
}
