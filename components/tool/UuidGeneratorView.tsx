'use client'

import {Check, CheckCircle2, Copy, RefreshCw, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useEffectEvent, useState} from 'react'
import {Button} from '@/components/ui/button'
import {SegmentedControl} from '../ui/segmented-control'

type UuidVersion = 'v4' | 'v7'

interface UuidItem {
  id: string
  value: string
}

function generateUuidV4(): string {
  return crypto.randomUUID()
}

function generateUuidV7(): string {
  const now = Date.now()
  const rand = crypto.getRandomValues(new Uint8Array(10))
  const bytes = new Uint8Array(16)
  // timestamp (48 bits) — big endian
  bytes[0] = (now / 2 ** 40) & 0xff
  bytes[1] = (now / 2 ** 32) & 0xff
  bytes[2] = (now / 2 ** 24) & 0xff
  bytes[3] = (now / 2 ** 16) & 0xff
  bytes[4] = (now / 2 ** 8) & 0xff
  bytes[5] = now & 0xff
  // version 7 (4 bits) + random (12 bits)
  bytes[6] = 0x70 | (rand[0] & 0x0f)
  bytes[7] = rand[1]
  // variant (2 bits) + random (62 bits)
  bytes[8] = 0x80 | (rand[2] & 0x3f)
  for (let i = 9; i < 16; i++) bytes[i] = rand[3 + i - 9]
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function UuidGeneratorView() {
  const tConfig = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [version, setVersion] = useState<UuidVersion>('v4')
  const [count, setCount] = useState(5)
  const [uppercase, setUppercase] = useState(false)
  const [noDashes, setNoDashes] = useState(false)
  const [items, setItems] = useState<UuidItem[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const generate = useEffectEvent(() => {
    const gen = version === 'v4' ? generateUuidV4 : generateUuidV7
    const next = Array.from({length: count}, () => ({
      id: crypto.randomUUID(),
      value: formatUuid(gen()),
    }))
    setItems(next)
  })

  useEffect(() => {
    generate()
  }, [])

  function formatUuid(uuid: string): string {
    let out = uuid
    if (noDashes) out = out.replace(/-/g, '')
    if (uppercase) out = out.toUpperCase()
    return out
  }

  async function copyOne(item: UuidItem) {
    try {
      await navigator.clipboard.writeText(item.value)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 1200)
    } catch {
      // ignore
    }
  }

  const [copiedAll, setCopiedAll] = useState(false)
  async function copyAll() {
    try {
      await navigator.clipboard.writeText(items.map(i => i.value).join('\n'))
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1500)
    } catch {
      // ignore
    }
  }

  function clear() {
    setItems([])
    setCopiedAll(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          name="uuid-version"
          value={version}
          onChange={setVersion}
          options={[
            {value: 'v4', label: tConfig('uuid-generator.versions.v4')},
            {value: 'v7', label: tConfig('uuid-generator.versions.v7')},
          ]}
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor="uuid-count"
            className="text-xs font-medium text-muted-foreground"
          >
            {tConfig('uuid-generator.countLabel')}
          </label>
          <input
            id="uuid-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={e =>
              setCount(Math.max(1, Math.min(100, Number(e.target.value))))
            }
            className="h-8 w-16 rounded-md border bg-transparent px-2 text-sm tabular-nums"
          />
        </div>

        <Button type="button" size="sm" onClick={generate}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          {tConfig('uuid-generator.generate')}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyAll}
          disabled={items.length === 0}
        >
          {copiedAll ? (
            <Check className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <Copy className="mr-1.5 h-3.5 w-3.5" />
          )}
          {tGlobal(copiedAll ? 'copiedAll' : 'copyAll')}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={items.length === 0}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {tGlobal('clear')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={e => setUppercase(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          {tConfig('uuid-generator.uppercase')}
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={noDashes}
            onChange={e => setNoDashes(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          {tConfig('uuid-generator.noDashes')}
        </label>
      </div>

      {items.length > 0 ? (
        <ul className="max-h-125 divide-y overflow-y-auto rounded-xl border bg-card">
          {items.map(item => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 px-4 py-2 font-mono text-sm"
            >
              <span className="flex-1 truncate">{item.value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyOne(item)}
                className="h-7 px-2 text-xs"
              >
                {copiedId === item.id ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          {tConfig('uuid-generator.emptyState')}
        </div>
      )}
    </div>
  )
}
