import Chart from 'react-apexcharts'
import type { Bottleneck, BottleneckSeverity } from '../types'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

const SEVERITY_LABELS: Record<BottleneckSeverity, string> = {
  critical: 'Critical',
  regulatory: 'Regulatory',
  delayed: 'Delayed',
  blocked: 'Blocked',
}

/**
 * Same colours as `SeverityBadge` (src/components/ui/status-badge.tsx), so a
 * severity reads identically whether it's a bar here or a badge in the list
 * beside it. ApexCharts can't resolve CSS custom properties for series
 * colours, so these are the same literal hex values as
 * --color-status-at-risk / --color-status-lagging / --color-status-delayed
 * in src/styles/theme.css — keep both in sync if either changes.
 */
const SEVERITY_COLORS: Record<BottleneckSeverity, string> = {
  critical: '#a8201a',
  regulatory: '#8f5605',
  delayed: '#a8201a',
  blocked: '#a8201a',
}

/**
 * Count of priority exceptions by severity, plotted against the *full*
 * exception list rather than the five-row visible slice below it — the point
 * is to show the shape of the whole exception load at a glance, which a
 * five-row sample would understate.
 */
export function ExceptionSeverityChart({ exceptions }: { exceptions: readonly Bottleneck[] }) {
  const counts = new Map<BottleneckSeverity, number>()
  for (const exception of exceptions) {
    counts.set(exception.severity, (counts.get(exception.severity) ?? 0) + 1)
  }

  const severities = (Object.keys(SEVERITY_LABELS) as BottleneckSeverity[]).filter(
    (severity) => (counts.get(severity) ?? 0) > 0,
  )

  if (severities.length === 0) return null

  return (
    <div
      role="img"
      aria-label={`Priority exceptions by severity, ${exceptions.length} total`}
    >
      <Chart
        type="bar"
        height={Math.max(120, severities.length * 46)}
        series={[{ name: 'Exceptions', data: severities.map((severity) => counts.get(severity) ?? 0) }]}
        options={{
          chart: {
            type: 'bar',
            toolbar: { show: false },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 500,
              dynamicAnimation: { enabled: true, speed: 500 },
            },
            fontFamily: FONT_FAMILY,
          },
          plotOptions: {
            bar: {
              horizontal: true,
              barHeight: '55%',
              borderRadius: 4,
              borderRadiusApplication: 'end',
              distributed: true,
            },
          },
          colors: severities.map((severity) => SEVERITY_COLORS[severity]),
          dataLabels: {
            enabled: true,
            offsetX: 8,
            textAnchor: 'start',
            formatter: (value: number) => String(value),
            style: {
              colors: ['var(--text-default)'],
              fontFamily: FONT_FAMILY,
              fontSize: '12px',
              fontWeight: 600,
            },
            background: { enabled: false },
          },
          grid: { padding: { right: 24, top: 0, bottom: 0 } },
          legend: { show: false },
          tooltip: {
            y: {
              formatter: (value: number) => `${value} exception${value === 1 ? '' : 's'}`,
            },
          },
          xaxis: {
            categories: severities.map((severity) => SEVERITY_LABELS[severity]),
            labels: { show: false },
            axisTicks: { show: false },
            axisBorder: { show: false },
          },
          yaxis: {
            labels: {
              style: {
                colors: 'var(--text-default)',
                fontFamily: FONT_FAMILY,
                fontSize: '12px',
              },
            },
          },
        }}
      />
    </div>
  )
}
