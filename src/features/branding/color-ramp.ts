/**
 * Derives the full brand-50…900 ramp from a single admin-picked primary
 * colour, so Customization only ever asks for one hex value — not nine.
 *
 * The primary colour is treated as the "600" step (matching where the
 * current hand-tuned Nigeria green ramp sits — see src/styles/theme.css),
 * and every other step keeps the same hue/saturation, varying only
 * lightness along a fixed curve calibrated against that existing ramp.
 */

interface Hsl {
  h: number
  s: number
  l: number
}

function hexToHsl(hex: string): Hsl {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return { h: 0, s: 0, l: l * 100 }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0)
      break
    case g:
      h = (b - r) / d + 2
      break
    default:
      h = (r - g) / d + 4
  }
  h *= 60

  return { h, s: s * 100, l: l * 100 }
}

function hslToHex({ h, s, l }: Hsl): string {
  const sNorm = s / 100
  const lNorm = l / 100
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r: number, g: number, b: number
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const toHex = (v: number) =>
    Math.round((v + m) * 255).toString(16).padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Lightness (%) at each step, calibrated against the existing hand-tuned ramp. */
const LIGHTNESS_STEPS: Record<string, number> = {
  '50': 95,
  '100': 86,
  '200': 73,
  '300': 57,
  '400': 40,
  '500': 30,
  '600': 26,
  '700': 22,
  '800': 17,
  '900': 13,
}

export type BrandRamp = Record<
  '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  string
>

/** Builds the 50–900 ramp from one hex colour, anchored at 600. */
export function buildColorRamp(primaryHex: string): BrandRamp {
  const anchor = hexToHsl(primaryHex)
  const anchorLightness = LIGHTNESS_STEPS['600']!
  // Preserve the primary's exact hex at 600 rather than round-tripping it
  // through HSL math, which can drift by a shade due to rounding.
  const ramp = {} as BrandRamp

  for (const [step, targetLightness] of Object.entries(LIGHTNESS_STEPS)) {
    if (step === '600') {
      ramp[step as keyof BrandRamp] = primaryHex
      continue
    }
    // Scale the delta from the anchor rather than setting lightness
    // absolutely, so a very dark or very light chosen primary still
    // produces a sensible spread instead of clipping at 0/100.
    const delta = targetLightness - anchorLightness
    const l = Math.min(97, Math.max(4, anchor.l + delta))
    ramp[step as keyof BrandRamp] = hslToHex({ h: anchor.h, s: anchor.s, l })
  }

  return ramp
}

export interface ChartScale {
  darkest: string
  dark: string
  base: string
  light: string
  lightest: string
}

/** Lightness (%) at each chart-scale step, calibrated against the existing hand-tuned CHART_BLUE. */
const CHART_LIGHTNESS_STEPS: Record<keyof ChartScale, number> = {
  darkest: 19,
  dark: 29,
  base: 39,
  light: 56,
  lightest: 80,
}

/**
 * Builds the 5-step chart colour scale (CHART_BLUE's shape) from one hex
 * colour, anchored at "dark" — the step most series colours read from.
 *
 * Capped at 90 lightness, not 97 like buildColorRamp's UI ramp: chart series
 * always sit on a plain white card (see DiscoComparisonChart), so a pale or
 * already-light admin secondary colour (e.g. a bright gold) must not push
 * "lightest" close enough to white to become an invisible bar - a 50-step
 * background swatch doesn't have that constraint, but a chart series does.
 */
export function buildChartScale(primaryHex: string): ChartScale {
  const anchor = hexToHsl(primaryHex)
  const anchorLightness = CHART_LIGHTNESS_STEPS.dark
  const scale = {} as ChartScale

  for (const [step, targetLightness] of Object.entries(CHART_LIGHTNESS_STEPS)) {
    if (step === 'dark') {
      scale.dark = primaryHex
      continue
    }
    const delta = targetLightness - anchorLightness
    const l = Math.min(90, Math.max(4, anchor.l + delta))
    scale[step as keyof ChartScale] = hslToHex({ h: anchor.h, s: anchor.s, l })
  }

  return scale
}
