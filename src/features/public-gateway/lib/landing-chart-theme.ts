import type { ApexOptions } from 'apexcharts'

/**
 * Chart language for the public landing pages only (public gateway `/` and
 * `/progress`). Deliberately separate from `config/chart-colors.ts`, which is
 * the authenticated app's single-hue chart language and must stay untouched —
 * same scoping principle as `.font-landing` in index.css.
 *
 * WHY A CATEGORICAL PALETTE AND NOT THE APP'S RAMP. The dashboard's charts
 * plot one metric at a time, so a single-hue ramp reads correctly there. This
 * page puts unrelated series side by side — channels, pillars, periods — and a
 * ramp would imply an ordering between them that does not exist. So: fixed
 * hues, assigned by position, anchored on the CDMU navy the rest of the
 * platform is built from rather than a generic data-viz palette.
 *
 * ACCESSIBILITY. Lightness descends monotonically across the first five
 * entries, so the series stay separable in greyscale — which is how these
 * charts reach most ministerial readers, photocopied into a briefing pack.
 * No red/green pair sits adjacent in the order.
 */
export const LANDING_FONT_FAMILY = "'Inter Tight', ui-sans-serif, system-ui, sans-serif"

export const LANDING_PALETTE = [
  '#004972', // CDMU navy — the primary series
  '#0f8b8d', // teal
  '#c2571a', // burnt orange
  '#5b4bb7', // violet
  '#00764a', // green
  '#8f5605', // bronze
  '#0077b9', // mid blue
] as const

/** Grey used for a projected or unapproved value, in every landing chart. */
export const LANDING_MUTED = '#98a2b3'

const AXIS_LABEL_STYLE = {
  fontSize: '12px',
  fontFamily: LANDING_FONT_FAMILY,
  fontWeight: 500,
}

/**
 * Shared base options every landing chart starts from — spread this first,
 * then override `series`/`xaxis.categories`/etc. per chart.
 *
 * `id` is not optional in practice: the PNG export in `download-chart.ts`
 * addresses a chart by id through `ApexCharts.exec`, so a chart without one
 * cannot be downloaded. Callers that genuinely have no export button may omit
 * it.
 */
export function landingChartBase(id?: string): ApexOptions {
  return {
    chart: {
      id,
      fontFamily: LANDING_FONT_FAMILY,
      toolbar: { show: false },
      // Off deliberately: a figure that animates into place on a government
      // record reads as a product demo, and the spec bans counting-up numbers
      // for the same reason.
      animations: { enabled: false },
      background: 'transparent',
      parentHeightOffset: 0,
    },
    colors: [...LANDING_PALETTE],
    grid: {
      borderColor: '#eaecf0',
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 4, right: 4, top: 0, bottom: 0 },
    },
    xaxis: {
      axisBorder: { show: true, color: '#d0d5dd' },
      axisTicks: { show: false },
      labels: { style: { colors: '#667085', ...AXIS_LABEL_STYLE }, rotate: 0, hideOverlappingLabels: true },
      crosshairs: { show: true, stroke: { color: '#d0d5dd', width: 1, dashArray: 3 } },
    },
    yaxis: {
      labels: {
        style: { colors: '#98a2b3', ...AXIS_LABEL_STYLE },
        formatter: (value: number) => compactNumber(value),
      },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'left',
      fontFamily: LANDING_FONT_FAMILY,
      fontSize: '12px',
      fontWeight: 500,
      labels: { colors: '#667085' },
      markers: { size: 5, shape: 'square' },
      itemMargin: { horizontal: 10, vertical: 2 },
      offsetY: 4,
    },
    tooltip: {
      style: { fontFamily: LANDING_FONT_FAMILY, fontSize: '12px' },
      x: { show: true },
      marker: { show: true },
    },
    states: { hover: { filter: { type: 'lighten' } } },
    dataLabels: { enabled: false },
  }
}

/**
 * Axis-tick formatter. Full numbers on an axis push the plot area sideways and
 * are read as magnitudes, not as exact values — the exact value is what the
 * tooltip is for.
 */
export function compactNumber(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}bn`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  if (abs > 0 && abs < 1) return value.toFixed(2)
  return value.toLocaleString('en-US')
}
