/**
 * Chart colour palette for Executive Overview's ApexCharts visuals.
 *
 * Deliberately blue-led rather than the red/green "traffic light" scheme used
 * for status badges elsewhere: stakeholder feedback was that Executive
 * Overview is read by leadership at a glance and should feel calm, not
 * alarm-coded. `ACCENT` is reserved for the one thing on a chart that most
 * needs attention (the worst segment, the value furthest behind target) —
 * everything else sits in the blue scale.
 */
export const CHART_BLUE = {
  darkest: '#1e3a8a',
  dark: '#1d4ed8',
  base: '#3b82f6',
  light: '#60a5fa',
  lightest: '#bfdbfe',
} as const

/** Reserved for the single segment or value most needing attention. */
export const CHART_ACCENT = '#f59e0b'

/** Ordered blue scale for multi-segment charts (darkest first). */
export const CHART_BLUE_SCALE = [
  CHART_BLUE.darkest,
  CHART_BLUE.dark,
  CHART_BLUE.base,
  CHART_BLUE.light,
  CHART_BLUE.lightest,
] as const
