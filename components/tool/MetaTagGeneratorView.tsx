'use client'

import {AtSign, Code2, Globe, RotateCcw, ThumbsUp} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {OutputPanel} from '@/components/shared/OutputPanel'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {Input} from '@/components/ui/input'
import {ColorPicker} from '../ui/color-picker'
import {SegmentedControl} from '../ui/segmented-control'

type Tab = 'google' | 'twitter' | 'facebook' | 'html'
type OgType = 'website' | 'article' | 'product' | 'profile' | 'video.other'

interface MetaFields {
  title: string
  description: string
  imageUrl: string
  siteUrl: string
  author: string
  themeColor: string
  keywords: string
  robots: boolean
}

const DEFAULTS: MetaFields = {
  title: 'Free Online Tools That Actually Work',
  description:
    'Free, fast, privacy-first online tools. Calculators, text utilities, generators, and developer tools that run 100% in your browser.',
  imageUrl: 'https://example.com/og-default.png',
  siteUrl: 'https://example.com',
  author: 'ProjectName Team',
  themeColor: '#2563eb',
  keywords: 'online tools, free tools, developer tools, calculators',
  robots: true,
}

const OG_TYPE: OgType = 'website'
const LOCALE = 'en_US'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtml(fields: MetaFields): string {
  const {
    title,
    description,
    imageUrl,
    siteUrl,
    author,
    themeColor,
    keywords,
    robots,
  } = fields

  const esc = (s: string) => escapeHtml(s.trim())

  const lines: string[] = []

  // Primary
  lines.push('<!-- Primary Meta Tags -->')
  if (title.trim()) lines.push(`<title>${esc(title)}</title>`)
  if (title.trim()) lines.push(`<meta name="title" content="${esc(title)}" />`)
  if (description.trim())
    lines.push(`<meta name="description" content="${esc(description)}" />`)
  if (keywords.trim())
    lines.push(`<meta name="keywords" content="${esc(keywords)}" />`)
  if (author.trim())
    lines.push(`<meta name="author" content="${esc(author)}" />`)
  if (themeColor.trim())
    lines.push(`<meta name="theme-color" content="${esc(themeColor)}" />`)
  lines.push(
    `<meta name="robots" content="${robots ? 'index, follow' : 'noindex, nofollow'}" />`,
  )
  lines.push(
    `<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />`,
  )

  lines.push('')

  // Open Graph
  lines.push('<!-- Open Graph / Facebook -->')
  lines.push(`<meta property="og:type" content="${OG_TYPE}" />`)
  if (siteUrl.trim())
    lines.push(`<meta property="og:url" content="${esc(siteUrl)}" />`)
  if (title.trim())
    lines.push(`<meta property="og:title" content="${esc(title)}" />`)
  if (description.trim())
    lines.push(
      `<meta property="og:description" content="${esc(description)}" />`,
    )
  if (imageUrl.trim())
    lines.push(`<meta property="og:image" content="${esc(imageUrl)}" />`)
  lines.push(`<meta property="og:locale" content="${LOCALE}" />`)

  lines.push('')

  // Twitter
  lines.push('<!-- Twitter -->')
  lines.push(`<meta property="twitter:card" content="summary_large_image" />`)
  if (siteUrl.trim())
    lines.push(`<meta property="twitter:url" content="${esc(siteUrl)}" />`)
  if (title.trim())
    lines.push(`<meta property="twitter:title" content="${esc(title)}" />`)
  if (description.trim())
    lines.push(
      `<meta property="twitter:description" content="${esc(description)}" />`,
    )
  if (imageUrl.trim())
    lines.push(`<meta property="twitter:image" content="${esc(imageUrl)}" />`)

  return lines.join('\n')
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url || 'example.com'
  }
}

export function MetaTagGeneratorView() {
  const t = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [fields, setFields] = useState<MetaFields>(DEFAULTS)
  const [tab, setTab] = useState<Tab>('google')

  const html = useMemo(() => buildHtml(fields), [fields])

  function update<K extends keyof MetaFields>(key: K, value: MetaFields[K]) {
    setFields(prev => ({...prev, [key]: value}))
  }

  function handleReset() {
    setFields(DEFAULTS)
  }

  function handleDownload() {
    const blob = new Blob([html], {type: 'text/html;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meta-tags.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* LEFT: Input form */}
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            {t('meta-tag-generator.siteDetails')}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-destructive hover:text-destructive"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {tGlobal('reset')}
          </Button>
        </div>

        <div className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="meta-title" className="text-sm font-medium">
                {t('meta-tag-generator.titleLabel')}
              </label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {fields.title.length} / 60
              </span>
            </div>
            <Input
              id="meta-title"
              value={fields.title}
              onChange={e => update('title', e.target.value)}
              placeholder={t('meta-tag-generator.titlePlaceholder')}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="meta-description" className="text-sm font-medium">
                {t('meta-tag-generator.descriptionLabel')}
              </label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {fields.description.length} / 160
              </span>
            </div>
            <textarea
              id="meta-description"
              value={fields.description}
              onChange={e => update('description', e.target.value)}
              placeholder={t('meta-tag-generator.descriptionPlaceholder')}
              rows={3}
              className="w-full resize-none rounded-lg border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="meta-image" className="text-sm font-medium">
              {t('meta-tag-generator.imageLabel')}
            </label>
            <Input
              id="meta-image"
              type="url"
              value={fields.imageUrl}
              onChange={e => update('imageUrl', e.target.value)}
              placeholder="https://example.com/og-default.png"
              spellCheck={false}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="meta-url" className="text-sm font-medium">
              {t('meta-tag-generator.urlLabel')}
            </label>
            <Input
              id="meta-url"
              type="url"
              value={fields.siteUrl}
              onChange={e => update('siteUrl', e.target.value)}
              placeholder="https://example.com"
              spellCheck={false}
            />
          </div>

          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <label htmlFor="meta-author" className="text-sm font-medium">
                {t('meta-tag-generator.authorLabel')}
              </label>
              <Input
                id="meta-author"
                value={fields.author}
                onChange={e => update('author', e.target.value)}
                placeholder="ProjectName Team"
              />
            </div>

            <div className="space-y-1.5 w-32">
              <label htmlFor="meta-theme" className="text-sm font-medium">
                {t('meta-tag-generator.themeColorLabel')}
              </label>
              <ColorPicker
                id="meta-theme"
                value={fields.themeColor}
                onChange={v => update('themeColor', v)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="meta-keywords" className="text-sm font-medium">
              {t('meta-tag-generator.keywordsLabel')}
            </label>
            <Input
              id="meta-keywords"
              value={fields.keywords}
              onChange={e => update('keywords', e.target.value)}
              placeholder="online tools, free tools"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 pt-1">
            <Checkbox
              checked={fields.robots}
              onCheckedChange={checked => update('robots', checked === true)}
            />
            <span className="text-sm">
              {t('meta-tag-generator.robotsLabel')}
            </span>
          </label>
        </div>
      </div>

      {/* RIGHT: Preview + HTML */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Tabs */}
        <SegmentedControl
          name="meta-preview-tab"
          value={tab}
          onChange={setTab}
          options={[
            {
              value: 'google',
              label: 'Google',
              icon: Globe,
            },
            {
              value: 'twitter',
              label: 'Twitter',
              icon: AtSign,
            },
            {
              value: 'facebook',
              label: 'Facebook',
              icon: ThumbsUp,
            },
            {
              value: 'html',
              label: t('meta-tag-generator.htmlTab'),
              icon: Code2,
            },
          ]}
        />

        {tab === 'google' && <GooglePreview fields={fields} />}
        {tab === 'twitter' && <TwitterPreview fields={fields} t={t} />}
        {tab === 'facebook' && <FacebookPreview fields={fields} t={t} />}
        {tab === 'html' && (
          <OutputPanel
            title={t('meta-tag-generator.outputTitle')}
            value={html}
            heightClass="min-h-[560px]"
            contentClassName="font-mono text-xs"
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  )
}

/* === Sub-components === */

interface PreviewProps {
  fields: MetaFields
  t: ReturnType<typeof useTranslations>
}

function GooglePreview({fields}: {fields: MetaFields}) {
  const host = safeHostname(fields.siteUrl)
  const title = fields.title || 'Your page title here'
  const description = fields.description || 'Your meta description here.'

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Google search preview</h3>
      <div className="rounded-xl border bg-background p-4">
        <div className="text-xs text-muted-foreground">{host}</div>
        <div className="mt-1 text-lg font-medium text-blue-600 hover:underline dark:text-blue-400">
          {title}
        </div>
        <div className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </div>
      </div>
    </div>
  )
}

function TwitterPreview({fields, t}: PreviewProps) {
  const host = safeHostname(fields.siteUrl)
  const title = fields.title || 'Your page title here'
  const description = fields.description || 'Your meta description here.'

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Twitter / X preview</h3>
      <div className="overflow-hidden rounded-2xl border bg-background">
        {fields.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: user-provided image URL
          <img
            src={fields.imageUrl}
            alt=""
            className="aspect-[1.91/1] w-full object-cover"
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-muted/40 text-xs text-muted-foreground">
            {t('meta-tag-generator.imagePreviewPlaceholder')}
          </div>
        )}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">{host}</div>
          <div className="mt-1 font-semibold">{title}</div>
          <div className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}

function FacebookPreview({fields, t}: PreviewProps) {
  const host = safeHostname(fields.siteUrl)
  const title = fields.title || 'Your page title here'
  const description = fields.description || 'Your meta description here.'

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Facebook preview</h3>
      <div className="overflow-hidden rounded-lg border bg-background">
        {fields.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: user-provided image URL
          <img
            src={fields.imageUrl}
            alt=""
            className="aspect-[1.91/1] w-full object-cover"
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-muted/40 text-xs text-muted-foreground">
            {t('meta-tag-generator.imagePreviewPlaceholder')}
          </div>
        )}
        <div className="border-t bg-muted/40 p-4">
          <div className="text-xs tracking-wide text-muted-foreground uppercase">
            {host}
          </div>
          <div className="mt-1 font-semibold">{title}</div>
          <div className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}
