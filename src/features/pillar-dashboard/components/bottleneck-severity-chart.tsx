import Chart from 'react-apexcharts'
import { SEVERITY_LABELS, type BottleneckRecord, type RegisterSeverity } from '@/api/schemas/bottlenecks'
import { CHART_ACCENT, CHART_BLUE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'
const SEVERITY_ORDER: readonly RegisterSeverity[] = ['critical', 'high', 'medium', 'low']
const SEVERITY_COLORS: Record<RegisterSeverity, string> = {
  critical: CHART_ACCENT,
  high: CHART_BLUE.darkest,
  medium: CHART_BLUE.base,
  low: CHART_BLUE.lightest,
}

/** How the pillar's top open bottlenecks break down by severity, at a glance. */
export function BottleneckSeverityChart({ records }: { records: readonly BottleneckRecord[] }) {
  const counts = SEVERITY_ORDER.map((severity) => ({
    severity,
    count: records.filter((record) => record.severity === severity).length,
  })).filter((entry) => entry.count > 0)

  if (counts.length === 0) {
    return <p className="py-8 text-center text-sm text-text-muted">No open bottlenecks to chart.</p>
  }

  return (
    <Chart
      type="bar"
      height={180}
      series={[{ name: 'Bottlenecks', data: counts.map((entry) => entry.count) }]}
      options={{
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: FONT_FAMILY },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 4,
            barHeight: '55%',
            distributed: true,
          },
        },
        colors: counts.map((entry) => SEVERITY_COLORS[entry.severity]),
        dataLabels: { enabled: true, style: { fontFamily: FONT_FAMILY, fontWeight: 600 } },
        xaxis: {
          categories: counts.map((entry) => SEVERITY_LABELS[entry.severity]),
          labels: { style: { fontFamily: FONT_FAMILY, fontSize: '11px' } },
        },
        legend: { show: false },
        grid: { borderColor: 'var(--border-default)' },
        tooltip: {
          y: { formatter: (value: number) => `${value} bottleneck${value === 1 ? '' : 's'}` },
        },
      }}
    />
  )
}
