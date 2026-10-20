import { useEffect, type ReactNode } from 'react'
import { CHART_BLUE, setChartAccent } from '@/config/chart-colors'
import { setActiveCurrency } from '@/lib/currency'
import { setDisplayTimeZone } from '@/lib/format'
import type { BrandFonts } from '@/api/schemas/branding'
import { useBrandConfig } from './api'
import { buildChartScale, buildColorRamp } from './color-ramp'
import { loadGoogleFonts } from './font-loader'

const STYLE_TAG_ID = 'brand-overrides'
const FONT_STYLE_TAG_ID = 'brand-font-overrides'

function applyFontOverrides(fonts: BrandFonts) {
  loadGoogleFonts(Object.values(fonts))

  const wrap = (family: string) => `'${family}', var(--font-sans)`
  const declarations = [
    `--font-heading-1: ${wrap(fonts.h1)};`,
    `--font-heading-2: ${wrap(fonts.h2)};`,
    `--font-heading-3: ${wrap(fonts.h3)};`,
    `--font-heading-4: ${wrap(fonts.h4)};`,
    `--font-heading-5: ${wrap(fonts.h5)};`,
    `--font-heading-6: ${wrap(fonts.h6)};`,
    `--font-body: ${wrap(fonts.body)};`,
  ].join('\n    ')

  let styleTag = document.getElementById(FONT_STYLE_TAG_ID) as HTMLStyleElement | null
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = FONT_STYLE_TAG_ID
    document.head.appendChild(styleTag)
  }
  styleTag.textContent = `:root, .dark {\n    ${declarations}\n  }`
}

function applyCssOverrides(
  primaryColor: string,
  secondaryColor: string,
  textColor: string,
  sidebarColor: string,
) {
  const ramp = buildColorRamp(primaryColor)
  const chartScale = buildChartScale(secondaryColor)

  // Shared between :root and .dark — the brand ramp and chart palette are
  // meant to read the same everywhere, including inside the sidebar's dark
  // scope (e.g. the active nav item's gold fill).
  const sharedDeclarations = [
    ...Object.entries(ramp).map(([step, hex]) => `--color-brand-${step}: ${hex};`),
    `--color-chart-accent: ${secondaryColor};`,
    `--color-chart-blue-darkest: ${chartScale.darkest};`,
    `--color-chart-blue-dark: ${chartScale.dark};`,
    `--color-chart-blue: ${chartScale.base};`,
    `--color-chart-blue-light: ${chartScale.light};`,
    `--color-chart-blue-lightest: ${chartScale.lightest};`,
  ].join('\n    ')

  let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = STYLE_TAG_ID
    document.head.appendChild(styleTag)
  }
  // The sidebar background is scoped to `.dark` only, not `:root` — the
  // sidebar is currently the only element carrying the `.dark` class (see
  // Sidebar.tsx), so this only ever touches the sidebar, never the rest of
  // the app's light-mode surfaces.
  //
  // `--text-default` is deliberately `:root`-only, NOT applied to `.dark`:
  // the admin's chosen text colour is a light-mode body-text concept, and
  // the sidebar's `.dark` scope needs its own always-light text regardless
  // of that choice (theme.css sets `.dark { --text-default: #f9fafb }` for
  // exactly this reason) — applying it to `.dark` too previously rendered
  // near-black sidebar nav text on the navy background.
  styleTag.textContent =
    `:root, .dark {\n    ${sharedDeclarations}\n  }\n` +
    `:root {\n    --text-default: ${textColor};\n  }\n` +
    `.dark {\n    --surface: ${sidebarColor};\n  }`

  // ApexCharts reads plain JS values, not CSS custom properties, so the
  // same admin-configured colours are mirrored onto the mutable chart
  // colour singleton — see the comment on CHART_BLUE in chart-colors.ts.
  CHART_BLUE.darkest = chartScale.darkest
  CHART_BLUE.dark = chartScale.dark
  CHART_BLUE.base = chartScale.base
  CHART_BLUE.light = chartScale.light
  CHART_BLUE.lightest = chartScale.lightest
  setChartAccent(secondaryColor)
}

/**
 * Applies the active site-wide brand configuration at runtime — no rebuild
 * needed. Mounted once near the app root (see src/app/providers.tsx).
 *
 * Colours: overrides the `--color-brand-*` / `--text-default` /
 * `--color-chart-*` CSS custom properties Tailwind's `@theme` block in
 * src/styles/theme.css already exposes, via one injected `<style>` tag —
 * every component already reads these through Tailwind utility classes, so
 * nothing else needs to change. The one exception is ApexCharts, which
 * cannot read CSS custom properties for series colours — see
 * `applyCssOverrides` above for how that's kept in sync.
 *
 * Renders children immediately rather than blocking on the fetch: the
 * default Nigeria colours are already the ones baked into theme.css, so
 * there's nothing to flash — an override only visibly changes anything once
 * an admin has actually saved a different configuration.
 */
export function BrandProvider({ children }: { children: ReactNode }) {
  const { data } = useBrandConfig()

  useEffect(() => {
    if (!data) return
    applyCssOverrides(data.primaryColor, data.secondaryColor, data.textColor, data.sidebarColor)
    applyFontOverrides(data.fonts)
    // Monetary formatters read this singleton rather than taking a prop, the
    // same way charts read CHART_BLUE — see src/lib/currency.ts.
    setActiveCurrency(data.currency)
    setDisplayTimeZone(data.timezone)
    document.title = `${data.countryName} Mission 300`
  }, [data])

  return children
}
