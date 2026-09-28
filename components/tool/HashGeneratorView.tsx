'use client'

import {Hash, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffectEvent, useState} from 'react'
import SparkMD5 from 'spark-md5'
import {CopyButton} from '../shared/CopyButton'
import {InputPanel} from '../shared/InputPanel'
import {Button} from '../ui/button'

type Algo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'

const ALGOS: Algo[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']

export function HashGeneratorView() {
  const tConfig = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<Algo, string> | null>(null)

  const computeHash = useEffectEvent(
    async (text: string, algo: Algo): Promise<string> => {
      if (algo === 'MD5') return SparkMD5.hash(text)

      const buf = new TextEncoder().encode(text)
      const hashBuf = await crypto.subtle.digest(algo, buf)
      return [...new Uint8Array(hashBuf)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    },
  )

  const handleHash = useEffectEvent(async () => {
    if (!input) {
      setHashes(null)
      return
    }
    const entries = await Promise.all(
      ALGOS.map(async algo => [algo, await computeHash(input, algo)] as const),
    )
    setHashes(Object.fromEntries(entries) as Record<Algo, string>)
  })

  const handleClear = useEffectEvent(() => {
    setInput('')
    setHashes(null)
  })

  const copyOne = useEffectEvent((algo: Algo) => {
    if (!hashes) return
    return `${algo}: ${hashes[algo]}`
  })

  const copyAll = useEffectEvent(() => {
    if (!hashes) return
    return ALGOS.map(algo => `${algo}: ${hashes[algo]}`).join('\n')
  })

  return (
    <div className="space-y-5">
      <InputPanel
        title={tConfig('hash-generator.inputLabel')}
        value={input}
        onChange={setInput}
        placeholder={tConfig('hash-generator.placeholder')}
        heightClass="h-[220px]"
        mono={false}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={handleHash} disabled={!input}>
          <Hash className="mr-1.5 h-3.5 w-3.5" />
          {tConfig('hash-generator.hashButton')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={!input && !hashes}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {tGlobal('clear')}
        </Button>
      </div>

      {hashes && (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {tConfig('hash-generator.resultsLabel')}
            </h3>
            <CopyButton
              labelIdle={tGlobal('copyAll')}
              labelSuccess={tGlobal('copiedAll')}
              getValue={copyAll}
              disabled={!hashes}
            />
          </div>

          <div className="space-y-3">
            {ALGOS.map(algo => (
              <div key={algo} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {algo}
                  </span>
                  <CopyButton getValue={() => copyOne(algo)} />
                </div>
                <p className="mt-1.5 font-mono text-xs break-all">
                  {hashes[algo]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
