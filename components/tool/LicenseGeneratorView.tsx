'use client'

import {Download, RotateCcw} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {LICENSE_TEMPLATES} from '@/data/tools/license-templates'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const CURRENT_YEAR = new Date().getFullYear()

export function LicenseGeneratorView() {
  const tConfig = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [licenseId, setLicenseId] = useState('mit')
  const [year, setYear] = useState(String(CURRENT_YEAR))
  const [name, setName] = useState('')
  const [project, setProject] = useState('')

  const template = useMemo(
    () =>
      LICENSE_TEMPLATES.find(l => l.id === licenseId) ?? LICENSE_TEMPLATES[0],
    [licenseId],
  )

  const text = useMemo(() => {
    let out = template.body
    if (template.usesYear) {
      out = out.replaceAll('{year}', year || String(CURRENT_YEAR))
    }
    if (template.usesName) {
      out = out.replaceAll('{name}', name || 'The Author')
    }
    if (template.usesProject) {
      out = out.replaceAll('{project}', project || '')
    }
    return out
  }, [template, year, name, project])

  function handleReset() {
    setLicenseId('mit')
    setYear(String(CURRENT_YEAR))
    setName('')
    setProject('')
  }

  function handleDownload() {
    const blob = new Blob([text], {type: 'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'LICENSE'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Settings */}
      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Select — License Type */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium">
              {tConfig('license-generator.licenseLabel')}
            </label>
            <Select
              items={LICENSE_TEMPLATES.map(l => ({
                value: l.id,
                label: l.name,
              }))}
              value={licenseId}
              onValueChange={v => setLicenseId(v ?? 'mit')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LICENSE_TEMPLATES.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {tConfig(`license-generator.hints.${template.id}`)}
            </p>
          </div>

          {template.usesYear && (
            <div className="space-y-1.5">
              <label htmlFor="lic-year" className="text-sm font-medium">
                {tConfig('license-generator.yearLabel')}
              </label>
              <Input
                id="lic-year"
                type="number"
                min={1970}
                max={2100}
                value={year}
                onChange={e => setYear(e.target.value)}
                className="tabular-nums"
              />
            </div>
          )}

          {template.usesName && (
            <div className="space-y-1.5">
              <label htmlFor="lic-name" className="text-sm font-medium">
                {tConfig('license-generator.nameLabel')}
              </label>
              <Input
                id="lic-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={tConfig('license-generator.namePlaceholder')}
              />
            </div>
          )}
        </div>

        {/* Project Name — на всю ширину, под сеткой */}
        <div className="space-y-1.5">
          <label htmlFor="lic-project" className="text-sm font-medium">
            {tConfig('license-generator.projectLabel')}
          </label>
          <Input
            id="lic-project"
            value={project}
            onChange={e => setProject(e.target.value)}
            placeholder={tConfig('license-generator.projectPlaceholder')}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {tConfig('license-generator.download')}
        </Button>
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
        <span className="ml-auto text-xs text-muted-foreground">
          {template.spdx}
        </span>
      </div>

      {/* Output */}
      <OutputPanel
        title={tConfig('license-generator.outputTitle')}
        value={text}
        heightClass="max-h-150"
        contentClassName="font-mono text-xs"
      />

      <p className="text-xs text-muted-foreground">
        {tConfig('license-generator.disclaimer')}
      </p>
    </div>
  )
}
