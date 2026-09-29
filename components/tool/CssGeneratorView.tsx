'use client'

import {Plus, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {Checkbox} from '../ui/checkbox'
import {ColorPicker} from '../ui/color-picker'
import {Label} from '../ui/label'
import {SegmentedControl} from '../ui/segmented-control'
import {Slider} from '../ui/slider'

type Mode = 'shadows' | 'gradients'
type GradientType = 'linear' | 'radial' | 'conic'

interface Shadow {
  id: string
  x: number
  y: number
  blur: number
  spread: number
  color: string
  alpha: number
  inset: boolean
}

interface ColorStop {
  id: string
  color: string
  position: number
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function hexToRgb(hex: string): {r: number; g: number; b: number} {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgba(hex: string, alpha: number): string {
  const {r, g, b} = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function buildShadowsCSS(shadows: Shadow[]): string {
  if (shadows.length === 0) return ''
  const parts = shadows.map(s => {
    const inset = s.inset ? ' inset' : ''
    return `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${rgba(s.color, s.alpha)}${inset}`
  })
  return `box-shadow: ${parts.join(', ')};`
}

function buildStopsCSS(stops: ColorStop[]): string {
  return stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(s => `${rgba(s.color, 1)} ${s.position}%`)
    .join(', ')
}

function buildGradientCSS(
  type: GradientType,
  angle: number,
  stops: ColorStop[],
): string {
  if (stops.length < 2) return ''
  const stopsStr = buildStopsCSS(stops)
  switch (type) {
    case 'linear':
      return `background: linear-gradient(${angle}deg, ${stopsStr});`
    case 'radial':
      return `background: radial-gradient(circle, ${stopsStr});`
    case 'conic':
      return `background: conic-gradient(from ${angle}deg, ${stopsStr});`
  }
}

const DEFAULT_SHADOW: Shadow = {
  id: uid(),
  x: 0,
  y: 4,
  blur: 16,
  spread: 0,
  color: '#000000',
  alpha: 0.25,
  inset: false,
}

const DEFAULT_STOPS: ColorStop[] = [
  {id: uid(), color: '#4f46e5', position: 0},
  {id: uid(), color: '#ec4899', position: 100},
]

export function CssGeneratorView() {
  const t = useTranslations('config.css-generator')

  const [mode, setMode] = useState<Mode>('shadows')

  // Shadows state
  const [shadows, setShadows] = useState<Shadow[]>([DEFAULT_SHADOW])

  // Gradients state
  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(90)
  const [stops, setStops] = useState<ColorStop[]>(DEFAULT_STOPS)

  const shadowsCSS = useMemo(() => buildShadowsCSS(shadows), [shadows])
  const gradientCSS = useMemo(
    () => buildGradientCSS(gradientType, angle, stops),
    [gradientType, angle, stops],
  )

  const [bgColor, setBgColor] = useState('#FFF')
  const [figureColor, setFigureColor] = useState('#000')

  const currentCSS = mode === 'shadows' ? shadowsCSS : gradientCSS

  const previewStyle =
    mode === 'shadows'
      ? {boxShadow: shadowsCSS.replace('box-shadow: ', '').replace(';', '')}
      : {background: gradientCSS.replace('background: ', '').replace(';', '')}

  // Shadow helpers
  const updateShadow = (id: string, patch: Partial<Shadow>) => {
    setShadows(prev => prev.map(s => (s.id === id ? {...s, ...patch} : s)))
  }
  const addShadow = () => {
    setShadows(prev => [
      ...prev,
      {...DEFAULT_SHADOW, id: uid(), y: 8, blur: 24},
    ])
  }
  const removeShadow = (id: string) => {
    setShadows(prev => (prev.length > 1 ? prev.filter(s => s.id !== id) : prev))
  }

  // Gradient helpers
  const updateStop = (id: string, patch: Partial<ColorStop>) => {
    setStops(prev => prev.map(s => (s.id === id ? {...s, ...patch} : s)))
  }
  const addStop = () => {
    const last = stops[stops.length - 1]
    setStops(prev => [
      ...prev,
      {
        id: uid(),
        color: last?.color ?? '#000000',
        position: Math.min(100, (last?.position ?? 100) + 10),
      },
    ])
  }
  const removeStop = (id: string) => {
    setStops(prev => (prev.length > 2 ? prev.filter(s => s.id !== id) : prev))
  }

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl<Mode>
        name="css-generator-mode"
        value={mode}
        onChange={setMode}
        options={[
          {value: 'shadows', label: t('tabs.shadows')},
          {value: 'gradients', label: t('tabs.gradients')},
        ]}
        className="self-start"
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: controls */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {mode === 'shadows' ? (
            <>
              {shadows.map((shadow, idx) => (
                <div
                  key={shadow.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                      {t('shadowLabel')} #{idx + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeShadow(shadow.id)}
                      disabled={shadows.length === 1}
                      aria-label={t('removeShadow')}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <NumberSlider
                    label={t('offsetX')}
                    value={shadow.x}
                    onChange={v => updateShadow(shadow.id, {x: v})}
                    min={-100}
                    max={100}
                  />
                  <NumberSlider
                    label={t('offsetY')}
                    value={shadow.y}
                    onChange={v => updateShadow(shadow.id, {y: v})}
                    min={-100}
                    max={100}
                  />
                  <NumberSlider
                    label={t('blur')}
                    value={shadow.blur}
                    onChange={v => updateShadow(shadow.id, {blur: v})}
                    min={0}
                    max={100}
                  />
                  <NumberSlider
                    label={t('spread')}
                    value={shadow.spread}
                    onChange={v => updateShadow(shadow.id, {spread: v})}
                    min={-50}
                    max={50}
                  />
                  <NumberSlider
                    label={t('alpha')}
                    value={Math.round(shadow.alpha * 100)}
                    onChange={v => updateShadow(shadow.id, {alpha: v / 100})}
                    min={0}
                    max={100}
                    suffix="%"
                  />

                  <div className="flex items-start gap-4 flex-wrap">
                    <Label className="flex cursor-pointer items-center gap-2 w-[50%]">
                      <Checkbox
                        checked={shadow.inset}
                        onCheckedChange={v =>
                          updateShadow(shadow.id, {inset: v === true})
                        }
                      />
                      <span className="text-xs">{t('inset')}</span>
                    </Label>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <ColorPicker
                          id="shadoColor"
                          value={shadow.color}
                          className="size-4 p-0 cursor-pointer"
                          onChange={v => updateShadow(shadow.id, {color: v})}
                        />
                        <Label
                          className="text-xs cursor-pointer"
                          htmlFor="shadoColor"
                        >
                          {t('shadowColor')}
                        </Label>
                      </div>

                      <div className="flex gap-2">
                        <ColorPicker
                          id="bgColor"
                          value={bgColor}
                          className="size-4 p-0 cursor-pointer"
                          onChange={setBgColor}
                        />
                        <Label
                          className="text-xs cursor-pointer"
                          htmlFor="bgColor"
                        >
                          {t('backgroundColor')}
                        </Label>
                      </div>

                      <div className="flex gap-2">
                        <ColorPicker
                          id="figureColor"
                          value={figureColor}
                          className="size-4 p-0 cursor-pointer"
                          onChange={setFigureColor}
                        />
                        <Label
                          className="text-xs cursor-pointer"
                          htmlFor="figureColor"
                        >
                          {t('figureColor')}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addShadow}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                {t('addShadow')}
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
              <SegmentedControl<GradientType>
                name="gradient-type"
                value={gradientType}
                onChange={setGradientType}
                options={[
                  {value: 'linear', label: t('gradientTypes.linear')},
                  {value: 'radial', label: t('gradientTypes.radial')},
                  {value: 'conic', label: t('gradientTypes.conic')},
                ]}
                className="self-start"
              />

              {gradientType !== 'radial' && (
                <NumberSlider
                  label={t('angle')}
                  value={angle}
                  onChange={setAngle}
                  min={0}
                  max={360}
                  suffix="°"
                />
              )}

              <Label className="mt-2 text-xs font-medium tracking-wide text-muted-foreground">
                {t('colorStops')}
              </Label>

              {stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex flex-col gap-2 rounded-lg border bg-background p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t('stopLabel')} #{idx + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStop(stop.id)}
                      disabled={stops.length <= 2}
                      aria-label={t('removeStop')}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <ColorPicker
                    value={stop.color}
                    onChange={v => updateStop(stop.id, {color: v})}
                  />
                  <NumberSlider
                    label={t('position')}
                    value={stop.position}
                    onChange={v => updateStop(stop.id, {position: v})}
                    min={0}
                    max={100}
                    suffix="%"
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addStop}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                {t('addStop')}
              </Button>
            </div>
          )}
        </div>

        {/* Right: preview + CSS */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div
            className="flex min-h-70 items-center justify-center rounded-xl border bg-card p-8 shadow-sm"
            style={{backgroundColor: bgColor}}
          >
            <div
              className="h-40 w-40 rounded-2xl bg-primary"
              style={{...previewStyle, backgroundColor: figureColor}}
            />
          </div>

          <OutputPanel
            title={t('cssLabel')}
            value={currentCSS}
            heightClass="h-auto min-h-[100px]"
            disableCopy={!currentCSS}
          />
        </div>
      </div>
    </div>
  )
}

interface NumberSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  suffix?: string
}

function NumberSlider({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: NumberSliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="font-mono text-xs text-muted-foreground">
          {value}
          {suffix ?? ''}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        value={[value]}
        onValueChange={v =>
          onChange(Array.isArray(v) ? (v[0] ?? min) : (v as number))
        }
      />
    </div>
  )
}
