/**
 * Chart colour palette for Executive Overview's ApexCharts visuals.
 *
 * Deliberately cool-led rather than the red/green "traffic light" scheme used
 * for status badges elsewhere: stakeholder feedback was that Executive
 * Overview is read by leadership at a glance and should feel calm, not
 * alarm-coded. The accent (see `getChartAccent`) is reserved for the one
 * thing on a chart that most needs attention (the worst segment, the value
 * furthest behind target) — everything else sits in the teal-to-navy scale.
 *
 * These values default to staying in sync with --color-chart-* in
 * src/styles/theme.css, duplicated only because ApexCharts cannot resolve
 * CSS custom properties for series colours.
 *
 * Deliberately mutable (not `as const`/frozen): `BrandProvider`
 * (src/features/branding/brand-provider.tsx) updates these properties in
 * place from the admin-configured secondary colour, so every chart file
 * reading `CHART_BLUE.dark` picks up the new value on its next render with
 * no change to the chart file itself. Read `CHART_BLUE.x` inside a
 * component's render body (not in a module-level constant computed once at
 * import time) if it needs to react to a brand-colour change.
 */
export const CHART_BLUE = {
  darkest: '#10314f',
  dark: '#17557f',
  base: '#1f7fa6',
  light: '#58aac4',
  lightest: '#b6d8e3',
}

let chartAccent = '#e08214'

/** The single segment or value most needing attention. Read inside a render body, not a module-level constant. */
export function getChartAccent(): string {
  return chartAccent
}

/** Set by BrandProvider when the admin-configured secondary colour changes. */
export function setChartAccent(hex: string): void {
  chartAccent = hex
}

/** Ordered blue scale for multi-segment charts (darkest first). Call inside a render body to reflect brand changes. */
export function getChartBlueScale(): readonly string[] {
  return [CHART_BLUE.darkest, CHART_BLUE.dark, CHART_BLUE.base, CHART_BLUE.light, CHART_BLUE.lightest]
}
