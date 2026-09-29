'use client'

import {useTranslations} from 'next-intl'
import {memo, useEffect, useMemo, useState} from 'react'
import {HexColorPicker} from 'react-colorful'
import {
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from '@/helpers/utils/colors'
import {useEvent} from '@/hooks/use-event'
import {CopyButton} from '../shared/CopyButton'
import {Input} from '../ui/input'

const DEFAULT_HEX = '#2563eb'

interface Palette {
  id: string
  colors: string[]
}

function shiftHue(h: number, delta: number): number {
  return (h + delta + 360) % 360
}

function buildPalettes(hex: string): Palette[] {
  const rgb = hexToRgb(hex) ?? {r: 0, g: 0, b: 0}
  const hsl = rgbToHsl(rgb)

  return (
    [
      {id: 'complementary', shifts: [180]},
      {id: 'analogous', shifts: [-30, 30]},
      {id: 'triadic', shifts: [120, 240]},
      {id: 'splitComplementary', shifts: [150, 210]},
      {id: 'monochromatic', shifts: null},
    ] as const
  ).map(({id, shifts}) => {
    if (id === 'monochromatic') {
      const colors = [10, 25, 50, 75, 90].map(l =>
        rgbToHex(hslToRgb({h: hsl.h, s: hsl.s, l})),
      )
      return {id, colors}
    }
    const colors = (shifts ?? []).map(delta =>
      rgbToHex(hslToRgb({h: shiftHue(hsl.h, delta), s: hsl.s, l: hsl.l})),
    )
    return {id, colors}
  })
}

function buildTintsAndShades(hsl: {h: number; s: number; l: number}): string[] {
  const lightnessLevels = [95, 87, 79, 71, 63, 55, 47, 39, 31, 23, 15, 10, 5]
  return lightnessLevels.map(l => rgbToHex(hslToRgb({h: hsl.h, s: hsl.s, l})))
}

export function ColorPickerView() {
  const t = useTranslations('config')

  const [hexInput, setHexInput] = useState(DEFAULT_HEX)
  const hex = useMemo(() => {
    const parsed = hexToRgb(hexInput)
    return parsed ? rgbToHex(parsed) : DEFAULT_HEX
  }, [hexInput])

  // Throttled hex для тяжёлых вычислений (палитры, tints)
  const [deferredHex, setDeferredHex] = useState(hex)
  useEffect(() => {
    const id = setTimeout(() => setDeferredHex(hex), 100)
    return () => clearTimeout(id)
  }, [hex])

  const {palettes, tintsShades} = useMemo(() => {
    const rgb = hexToRgb(deferredHex) ?? {r: 0, g: 0, b: 0}
    const hsl = rgbToHsl(rgb)
    return {
      palettes: buildPalettes(deferredHex),
      tintsShades: buildTintsAndShades(hsl),
    }
  }, [deferredHex])

  const rgb = useMemo(
    () => hexToRgb(deferredHex) ?? {r: 0, g: 0, b: 0},
    [deferredHex],
  )
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb])
  const hsv = useMemo(() => rgbToHsv(rgb), [rgb])

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  const hsvString = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`

  const handleHexChange = useEvent(function handleHexChange(value: string) {
    setHexInput(value)
  })

  const handleHslChange = useEvent(function handleHslChange(
    channel: keyof typeof hsl,
    value: number,
  ) {
    const next = {...hsl, [channel]: value}
    setHexInput(rgbToHex(hslToRgb(next)))
  })

  const handleHsvChange = useEvent(function handleHsvChange(
    channel: keyof typeof hsv,
    value: number,
  ) {
    const next = {...hsv, [channel]: value}
    setHexInput(rgbToHex(hsvToRgb(next)))
  })

  return (
    <div className="space-y-5">
      {/* Main color picker */}
      <div className="grid gap-5 rounded-2xl border bg-card p-5 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="size-32 rounded-full border-4 border-white shadow-inner dark:border-gray-700"
            style={{background: hex}}
          />
          <div className="w-full max-w-[240px]">
            <HexColorPicker
              color={hex}
              onChange={setHexInput}
              style={{width: '100%', height: 200}}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* HEX */}
          <ValueRow label="HEX" value={hex}>
            <Input
              value={hexInput}
              onChange={e => handleHexChange(e.target.value)}
              className="h-9 w-full font-mono text-sm"
              spellCheck={false}
            />
          </ValueRow>

          {/* RGB */}
          <ValueRow label="RGB" value={rgbString}>
            <div className="grid grid-cols-3 gap-2">
              <ChannelInput
                label="R"
                value={rgb.r}
                max={255}
                onChange={v => setHexInput(rgbToHex({...rgb, r: v}))}
              />
              <ChannelInput
                label="G"
                value={rgb.g}
                max={255}
                onChange={v => setHexInput(rgbToHex({...rgb, g: v}))}
              />
              <ChannelInput
                label="B"
                value={rgb.b}
                max={255}
                onChange={v => setHexInput(rgbToHex({...rgb, b: v}))}
              />
            </div>
          </ValueRow>

          {/* HSL */}
          <ValueRow label="HSL" value={hslString}>
            <div className="grid grid-cols-3 gap-2">
              <ChannelInput
                label="H"
                value={hsl.h}
                max={360}
                onChange={v => handleHslChange('h', v)}
              />
              <ChannelInput
                label="S"
                value={hsl.s}
                max={100}
                onChange={v => handleHslChange('s', v)}
              />
              <ChannelInput
                label="L"
                value={hsl.l}
                max={100}
                onChange={v => handleHslChange('l', v)}
              />
            </div>
          </ValueRow>

          {/* HSV */}
          <ValueRow label="HSV" value={hsvString}>
            <div className="grid grid-cols-3 gap-2">
              <ChannelInput
                label="H"
                value={hsv.h}
                max={360}
                onChange={v => handleHsvChange('h', v)}
              />
              <ChannelInput
                label="S"
                value={hsv.s}
                max={100}
                onChange={v => handleHsvChange('s', v)}
              />
              <ChannelInput
                label="V"
                value={hsv.v}
                max={100}
                onChange={v => handleHsvChange('v', v)}
              />
            </div>
          </ValueRow>
        </div>
      </div>

      {/* Tints & shades of the current color */}
      <div className="space-y-2 rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">
          {t('color-picker.tintsShadesTitle')}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {tintsShades.map((c, i) => (
            <Swatch key={`${c}-${i}`} hex={c} />
          ))}
        </div>
      </div>

      {/* Palettes */}
      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold">
          {t('color-picker.palettesTitle')}
        </h3>

        {palettes.map(palette => (
          <div key={palette.id} className="space-y-2">
            <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t(`color-picker.palettes.${palette.id}`)}
            </div>
            <div className="flex flex-wrap gap-2">
              <Swatch hex={hex} label={t('color-picker.baseLabel')} />
              {palette.colors.map((c, i) => (
                <Swatch key={`${palette.id}-${i}`} hex={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ValueRowProps {
  label: string
  value: string
  children: React.ReactNode
}

const ValueRow = memo(function ValueRow({
  label,
  value,
  children,
}: ValueRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[80px_1fr_auto] sm:items-center">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div>{children}</div>
      <CopyButton
        getValue={() => value}
        showLabel={false}
        className="h-7 w-7 p-0"
      />
    </div>
  )
})

interface ChannelInputProps {
  label: string
  value: number
  max: number
  onChange: (value: number) => void
}

const ChannelInput = memo(function ChannelInput({
  label,
  value,
  max,
  onChange,
}: ChannelInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </label>
      <Input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={e => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) {
            onChange(Math.max(0, Math.min(max, Math.round(n))))
          }
        }}
        className="h-9 text-center tabular-nums"
      />
    </div>
  )
})

interface SwatchProps {
  hex: string
  label?: string
}

const Swatch = memo(function Swatch({hex, label}: SwatchProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative flex size-14 items-center justify-center rounded-lg border shadow-sm transition hover:scale-105"
        style={{background: hex}}
      >
        <CopyButton
          getValue={() => hex}
          showLabel={false}
          className="size-6 p-0 opacity-0 transition group-hover:opacity-100"
        />
      </div>
      <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
        {hex}
      </span>
      {label && (
        <span className="text-[10px] text-muted-foreground">{label}</span>
      )}
    </div>
  )
})
