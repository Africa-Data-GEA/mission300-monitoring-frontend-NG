import Chart from 'react-apexcharts'
import type { PerformanceTrendMetric, PerformanceTrendPoint } from '@/api/schemas/state-disco'
import { Card } from '@/components/ui/card'
import { CHART_BLUE, getChartAccent } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/**
 * One utility metric across every reported quarter. A quarter with no data
 * for this metric is a gap in the line, never a drop to zero, so a missing
 * NERC table can't read as a collapse in performance.
 */
export function PerformanceTrendChart({
  title,
  metric,
  points,
  target,
  lowerIsBetter = false,
}: {
  title: string
  metric: PerformanceTrendMetric
  points: readonly PerformanceTrendPoint[]
  target?: number
  lowerIsBetter?: boolean
}) {
  const values = points.map((point) => point[metric])
  const reported = points.filter((point) => point[metric] !== null)
  const latest = reported.at(-1)
  const first = reported[0]
  const change =
    latest && first && latest !== first ? Math.round(((latest[metric] ?? 0) - (first[metric] ?? 0)) * 10) / 10 : null
  const improving = change !== null && (lowerIsBetter ? change < 0 : change > 0)
  const yMax = Math.max(100, Math.ceil(Math.max(0, ...reported.map((point) => point[metric] ?? 0)) / 10) * 10)

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-default">{title}</h3>
        {latest ? (
          <p className="text-right text-xs text-text-muted">
            <span className="text-lg font-semibold text-text-default tabular-nums">{latest[metric]}%</span>{' '}
            {latest.label}
          </p>
        ) : (
          <p className="text-xs text-text-muted">Not reported</p>
        )}
      </div>
      {change !== null && first && (
        <p className={improving ? 'text-xs text-status-on-track' : 'text-xs text-status-at-risk'}>
          {change > 0 ? '+' : ''}
          {change} pts since {first.label}
        </p>
      )}

      {reported.length === 0 ? (
        <p className="mt-6 mb-4 text-sm text-text-muted">No quarter has data for this metric yet.</p>
      ) : (
        <Chart
          type="line"
          height={220}
          series={[{ name: title, data: values }]}
          options={{
            chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: FONT_FAMILY },
            colors: [CHART_BLUE.dark],
            stroke: { width: 2.5, curve: 'straight' },
            markers: { size: 3, strokeWidth: 0, hover: { size: 5 } },
            dataLabels: { enabled: false },
            xaxis: {
              categories: points.map((point) => point.label),
              tickAmount: Math.min(8, points.length),
              labels: { rotate: -45, style: { fontSize: '10px' } },
            },
            yaxis: { min: 0, max: yMax, tickAmount: 4, labels: { formatter: (value) => `${Math.round(value)}%` } },
            grid: { borderColor: 'var(--border-default)' },
            legend: { show: false },
            annotations:
              target === undefined
                ? undefined
                : {
                    yaxis: [
                      {
                        y: target,
                        borderColor: getChartAccent(),
                        strokeDashArray: 4,
                        label: {
                          text: `Target ${target}%`,
                          borderColor: 'transparent',
                          style: { background: 'transparent', color: 'var(--text-muted)', fontFamily: FONT_FAMILY },
                        },
                      },
                    ],
                  },
            tooltip: {
              y: {
                formatter: (value, opts) => {
                  if (value === null || value === undefined) return 'Not reported'
                  const point = opts ? points[opts.dataPointIndex] : undefined
                  return point ? `${value}% · ${point.reportingDiscos} DisCo${point.reportingDiscos === 1 ? '' : 's'}` : `${value}%`
                },
              },
            },
          }}
        />
      )}
    </Card>
  )
}
