'use client'

import {RefreshCw} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useCallback, useEffect, useState} from 'react'
import {CopyButton} from '../shared/CopyButton'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Label} from '../ui/label'
import {Slider} from '../ui/slider'

interface Options {
  length: number
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/',
}

const AMBIGUOUS = 'il1Lo0O'

function generatePassword(options: Options): string {
  const {length, lowercase, uppercase, numbers, symbols, excludeAmbiguous} =
    options

  let charset = ''
  if (lowercase) charset += CHARSETS.lowercase
  if (uppercase) charset += CHARSETS.uppercase
  if (numbers) charset += CHARSETS.numbers
  if (symbols) charset += CHARSETS.symbols

  if (excludeAmbiguous) {
    charset = charset
      .split('')
      .filter(c => !AMBIGUOUS.includes(c))
      .join('')
  }

  if (!charset) return ''

  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)

  let out = ''
  for (let i = 0; i < length; i++) {
    out += charset[bytes[i] % charset.length]
  }
  return out
}

function scorePassword(pw: string): number {
  // 0–4, грубая оценка
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (pw.length >= 16) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(4, Math.floor((score * 4) / 6))
}

interface StrengthLevel {
  label: string
  color: string
  width: string
}

export function PasswordGeneratorView() {
  const t = useTranslations('config')

  const [options, setOptions] = useState<Options>({
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  })
  const [password, setPassword] = useState('')

  const regenerate = useCallback(() => {
    setPassword(generatePassword(options))
  }, [options])

  useEffect(() => {
    regenerate()
  }, [regenerate])

  function toggle(key: keyof Options) {
    setOptions(prev => ({...prev, [key]: !prev[key]}))
  }

  const score = scorePassword(password)
  const strengthLabels = [
    t('password-generator.strength.weak'),
    t('password-generator.strength.fair'),
    t('password-generator.strength.good'),
    t('password-generator.strength.strong'),
    t('password-generator.strength.excellent'),
  ]
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-emerald-500',
  ]
  const strengthWidths = ['20%', '40%', '60%', '80%', '100%']

  const strength: StrengthLevel = {
    label: strengthLabels[score],
    color: strengthColors[score],
    width: strengthWidths[score],
  }

  return (
    <div className="space-y-5">
      {/* Password display */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={password}
            readOnly
            spellCheck={false}
            className="h-11 flex-1 rounded-lg border bg-background px-4 font-mono text-base outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={t('password-generator.passwordLabel')}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={regenerate}
            aria-label={t('password-generator.regenerate')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <CopyButton
            getValue={() => password}
            showLabel={false}
            className="h-11 w-11 border bg-background p-0 text-foreground hover:bg-accent"
          />
        </div>

        {/* Strength bar */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t('password-generator.strengthLabel')}
            </span>
            <span className="font-medium">{strength.label}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${strength.color}`}
              style={{width: strength.width}}
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        {/* Length slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="pw-length">{t('password-generator.length')}</Label>
            <Input
              id="pw-length"
              type="number"
              min={4}
              max={128}
              value={options.length}
              onChange={e => {
                const n = Math.max(
                  4,
                  Math.min(128, Number(e.target.value) || 4),
                )
                setOptions(prev => ({...prev, length: n}))
              }}
              className="h-8 w-20 text-right tabular-nums"
            />
          </div>
          <Slider
            value={[options.length]}
            min={4}
            max={128}
            step={1}
            onValueChange={next =>
              setOptions(prev => ({
                ...prev,
                length: Array.isArray(next) ? next[0] : next,
              }))
            }
          />
        </div>

        {/* Character toggles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ToggleRow
            id="pw-lowercase"
            label={t('password-generator.lowercase')}
            checked={options.lowercase}
            onToggle={() => toggle('lowercase')}
          />
          <ToggleRow
            id="pw-uppercase"
            label={t('password-generator.uppercase')}
            checked={options.uppercase}
            onToggle={() => toggle('uppercase')}
          />
          <ToggleRow
            id="pw-numbers"
            label={t('password-generator.numbers')}
            checked={options.numbers}
            onToggle={() => toggle('numbers')}
          />
          <ToggleRow
            id="pw-symbols"
            label={t('password-generator.symbols')}
            checked={options.symbols}
            onToggle={() => toggle('symbols')}
          />
          <ToggleRow
            id="pw-ambiguous"
            label={t('password-generator.excludeAmbiguous')}
            checked={options.excludeAmbiguous}
            onToggle={() => toggle('excludeAmbiguous')}
          />
        </div>

        <Button type="button" onClick={regenerate} className="w-full">
          <RefreshCw className="mr-1.5 h-4 w-4" />
          {t('password-generator.generate')}
        </Button>
      </div>
    </div>
  )
}

interface ToggleRowProps {
  id: string
  label: string
  checked: boolean
  onToggle: () => void
}

function ToggleRow({id, label, checked, onToggle}: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${
        checked
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-background hover:bg-muted/40'
      }`}
      id={id}
    >
      <span className={checked ? 'font-medium' : 'text-muted-foreground'}>
        {label}
      </span>
      <span
        className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${
          checked
            ? 'border-primary bg-primary'
            : 'border-muted-foreground/40 bg-transparent'
        }`}
      />
    </button>
  )
}
