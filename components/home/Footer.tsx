import {ShieldCheckIcon} from '@animateicons/react/lucide'
import {useTranslations} from 'next-intl'
import {Badge} from '../ui/badge'

export function Footer() {
  const tHome = useTranslations('home')
  return (
    <section className="page flex flex-col gap-6 pt-0">
      <div className="p-3.5 rounded-md bg-secondary/50">
        <div className="flex gap-2 items-start">
          <span className="shrink-0 size-12 flex items-center justify-center bg-secondary rounded-lg text-success-custom-foreground">
            <ShieldCheckIcon className="size-10" />
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-secondary-foreground">
                {tHome('privacy.label')}
              </span>
              <Badge
                variant="success"
                className="uppercase font-tag font-semibold text-xs tracking-wider"
              >
                {tHome('privacy.badge')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {tHome('privacy.text')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
