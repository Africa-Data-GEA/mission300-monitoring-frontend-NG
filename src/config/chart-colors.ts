/**
 * Chart colour palette for Executive Overview's ApexCharts visuals.
 *
 * Deliberately cool-led rather than the red/green "traffic light" scheme used
 * for status badges elsewhere: stakeholder feedback was that Executive
 * Overview is read by leadership at a glance and should feel calm, not
 * alarm-coded. `ACCENT` is reserved for the one thing on a chart that most
 * needs attention (the worst segment, the value furthest behind target) —
 * everything else sits in the teal-to-navy scale.
 *
 * These values MUST stay in sync with --color-chart-* in src/styles/theme.css.
 * They are duplicated only because ApexCharts cannot resolve CSS custom
 * properties for series colours.
 */
export const CHART_BLUE = {
  darkest: '#10314f',
  dark: '#17557f',
  base: '#1f7fa6',
  light: '#58aac4',
  lightest: '#b6d8e3',
} as const

/** Reserved for the single segment or value most needing attention. */
export const CHART_ACCENT = '#e08214'

/** Ordered blue scale for multi-segment charts (darkest first). */
export const CHART_BLUE_SCALE = [
  CHART_BLUE.darkest,
  CHART_BLUE.dark,
  CHART_BLUE.base,
  CHART_BLUE.light,
  CHART_BLUE.lightest,
] as const
