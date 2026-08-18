import type { ApexOptions } from 'apexcharts'

/**
 * Chart language for the public landing pages only (public gateway `/` and
 * `/progress`) — modelled on the IEA electricity data explorer's charts,
 * per direct reference. Deliberately separate from `config/chart-colors.ts`,
 * which is the authenticated app's own calm, single-hue chart language and
 * must stay untouched — this file is the landing-page equivalent, same
 * scoping principle as `.font-landing` in index.css.
 *
 * IEA traits reproduced: a fixed categorical palette (not shades of one
 * colour), white background with only horizontal gridlines, a bordered
 * white tooltip with a bold value, and a bottom horizontal legend.
 */
export const LANDING_FONT_FAMILY = "'Inter Tight', ui-sans-serif, system-ui, sans-serif"

export const LANDING_PALETTE = [
  '#8B5CF6', // wind — purple
  '#F97316', // solar — orange
  '#FACC15', // other — yellow
  '#0D9488', // nuclear-equivalent — teal
  '#22C55E', // natural-gas-equivalent — green
  '#3B5FE0', // hydro-equivalent — mid blue
  '#38BDF8', // coal-equivalent — light blue
] as const

/** Shared base options every landing chart starts from — spread this first,
 * then override `series`/`xaxis.categories`/etc. per chart. */
export function landingChartBase(): ApexOptions {
  return {
    chart: {
      fontFamily: LANDING_FONT_FAMILY,
      toolbar: { show: false },
      animations: { enabled: false },
      background: 'transparent',
    },
    colors: [...LANDING_PALETTE],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      axisBorder: { show: true, color: '#111827' },
      axisTicks: { show: false },
      labels: { style: { colors: '#374151', fontSize: '12px', fontFamily: LANDING_FONT_FAMILY } },
    },
    yaxis: {
      labels: {
        style: { colors: '#6B7280', fontSize: '12px', fontFamily: LANDING_FONT_FAMILY },
        formatter: (value: number) => value.toLocaleString('en-US'),
      },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'left',
      fontFamily: LANDING_FONT_FAMILY,
      fontSize: '13px',
      markers: { size: 6, shape: 'circle' },
      itemMargin: { horizontal: 10, vertical: 4 },
    },
    tooltip: {
      style: { fontFamily: LANDING_FONT_FAMILY, fontSize: '13px' },
      x: { show: true },
    },
    dataLabels: { enabled: false },
  }
}

/** The bold-title + grey-unit-subtitle block IEA runs above every chart —
 * plain HTML, not an ApexCharts `title`/`subtitle` option, so it can wrap
 * and stay accessible as a real heading. */
export const LANDING_CHART_TITLE_CLASSES = 'text-[1.0625rem] leading-6 font-bold tracking-tight text-text-default'
export const LANDING_CHART_UNIT_CLASSES = 'mt-0.5 text-[0.8125rem] leading-4 text-text-subtle'
