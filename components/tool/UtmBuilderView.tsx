'use client'

import {AlertCircle, RotateCcw} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {CopyButton} from '@/components/shared/CopyButton'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'

interface UtmFields {
  url: string
  source: string
  medium: string
  campaign: string
  term: string
  content: string
}

const INITIAL: UtmFields = {
  url: '',
  source: '',
  medium: '',
  campaign: '',
  term: '',
  content: '',
}

const UTM_KEYS: (keyof Omit<UtmFields, 'url'>)[] = [
  'source',
  'medium',
  'campaign',
  'term',
  'content',
]

function isValidUrl(value: string): boolean {
  if (!value) return false
  return /^https?:\/\/.+/i.test(value.trim())
}

function buildUtmUrl(fields: UtmFields): string {
  const base = fields.url.trim()
  if (!base) return ''

  const params: string[] = []
  for (const key of UTM_KEYS) {
    const value = fields[key].trim()
    if (!value) continue
    params.push(`utm_${key}=${encodeURIComponent(value)}`)
  }

  if (params.length === 0) return base

  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}${params.join('&')}`
}

export function UtmBuilderView() {
  const t = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [fields, setFields] = useState<UtmFields>(INITIAL)

  const result = useMemo(() => buildUtmUrl(fields), [fields])

  const urlWarning = fields.url.trim().length > 0 && !isValidUrl(fields.url)

  function update<K extends keyof UtmFields>(key: K, value: UtmFields[K]) {
    setFields(prev => ({...prev, [key]: value}))
  }

  function handleReset() {
    setFields(INITIAL)
  }

  return (
    <div className="space-y-5">
      {/* Base URL */}
      <div className="space-y-1.5 rounded-2xl border bg-card p-5">
        <label htmlFor="utm-url" className="text-sm font-medium">
          {t('utm-builder.urlLabel')}
        </label>
        <Input
          id="utm-url"
          value={fields.url}
          onChange={e => update('url', e.target.value)}
          placeholder={t('utm-builder.urlPlaceholder')}
          className="font-mono"
          spellCheck={false}
        />
        {urlWarning && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            {t('utm-builder.urlWarning')}
          </p>
        )}
      </div>

      {/* UTM Parameters */}
      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="utm-source" className="text-sm font-medium">
              {t('utm-builder.sourceLabel')}
              <span className="ml-1 text-destructive">*</span>
            </label>
            <Input
              id="utm-source"
              value={fields.source}
              onChange={e => update('source', e.target.value)}
              placeholder={t('utm-builder.sourcePlaceholder')}
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              {t('utm-builder.sourceHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="utm-medium" className="text-sm font-medium">
              {t('utm-builder.mediumLabel')}
            </label>
            <Input
              id="utm-medium"
              value={fields.medium}
              onChange={e => update('medium', e.target.value)}
              placeholder={t('utm-builder.mediumPlaceholder')}
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              {t('utm-builder.mediumHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="utm-campaign" className="text-sm font-medium">
              {t('utm-builder.campaignLabel')}
            </label>
            <Input
              id="utm-campaign"
              value={fields.campaign}
              onChange={e => update('campaign', e.target.value)}
              placeholder={t('utm-builder.campaignPlaceholder')}
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              {t('utm-builder.campaignHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="utm-term" className="text-sm font-medium">
              {t('utm-builder.termLabel')}
            </label>
            <Input
              id="utm-term"
              value={fields.term}
              onChange={e => update('term', e.target.value)}
              placeholder={t('utm-builder.termPlaceholder')}
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              {t('utm-builder.termHint')}
            </p>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="utm-content" className="text-sm font-medium">
              {t('utm-builder.contentLabel')}
            </label>
            <Input
              id="utm-content"
              value={fields.content}
              onChange={e => update('content', e.target.value)}
              placeholder={t('utm-builder.contentPlaceholder')}
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              {t('utm-builder.contentHint')}
            </p>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="space-y-3 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">
            {t('utm-builder.resultLabel')}
          </h3>
          <div className="flex items-center gap-2">
            <CopyButton
              getValue={() => result}
              disabled={!result}
              className="h-8 gap-1.5 px-3 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={
                !fields.url &&
                !fields.source &&
                !fields.medium &&
                !fields.campaign &&
                !fields.term &&
                !fields.content
              }
              className="text-destructive hover:text-destructive"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {tGlobal('reset')}
            </Button>
          </div>
        </div>

        {result ? (
          <p className="rounded-lg border bg-muted/30 p-3 font-mono text-xs leading-relaxed break-all">
            {result}
          </p>
        ) : (
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {t('utm-builder.emptyState')}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('utm-builder.privacyNote')}
      </p>
    </div>
  )
}
