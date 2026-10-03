import {useTranslations} from 'next-intl'
import {SearchTrigger} from '../search/SearchTrigger'
import {Badge} from '../ui/badge'
import {Stats} from './Stats'

export function Hero() {
  const tHome = useTranslations('home')

  return (
    <section
      className="page text-center flex flex-col items-center gap-4 pb-0"
      data-testid="home-hero"
    >
      <Badge
        variant="outline"
        className="font-tag gap-2 rounded-full bg-muted/25 text-muted-foreground px-3 my-3 text-[11px] font-semibold uppercase shadow-xs"
      >
        <span className="relative flex size-1.25">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-1.25 rounded-full bg-emerald-500" />
        </span>
        {tHome('badge.free')}
        <span className="text-muted-foreground/25">{' • '}</span>
        {tHome('badge.no-signup')}
        <span className="text-muted-foreground/25">{' • '}</span>
        {tHome('badge.privacy')}
      </Badge>

      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {tHome('h1')}
        </h1>

        <p className="text-muted-foreground">{tHome('subtitle')}</p>

        <SearchTrigger
          variant="full"
          placeholder={tHome('search.placeholder')}
          buttonClassName="m-auto h-10 outline sm:h-12 shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl transition-[shadow] duration-200 ease-linear"
          kbdClassName="inline-block opacity-100!"
        />

        <Stats />
      </div>
    </section>
  )
}
