import Chart from 'react-apexcharts'
import { EXECUTION_STATUS_LABELS, type ExecutionStatus } from '@/api/schemas/programs'
import { CHART_ACCENT, CHART_BLUE } from '@/config/chart-colors'
import type { ProjectStatusSummary } from '../types'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'
const STATUS_COLORS: Record<Exclude<ExecutionStatus, 'completed'>, string> = {
  'on-track': CHART_BLUE.darkest,
  'at-risk': CHART_BLUE.base,
  delayed: CHART_BLUE.light,
  blocked: CHART_ACCENT,
}

export function ProjectStatusChart({ summary }: { summary: readonly ProjectStatusSummary[] }) {
  const total = summary.reduce((sum, entry) => sum + entry.count, 0)

  if (total === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">No ongoing projects to chart.</p>
  }

  return (
    <div
      role="img"
      aria-label={`Delivery status distribution for ${total} ongoing projects`}
      className="rounded-xl border border-border-default bg-surface-card p-3"
    >
      <div className="px-2 pt-1">
        <h4 className="text-sm font-semibold text-text-default">Ongoing projects by status</h4>
        <p className="mt-1 text-xs text-text-muted">
          Portfolio-wide distribution of current project delivery status.
        </p>
      </div>

      <Chart
        type="donut"
        height={390}
        series={summary.map((entry) => entry.count)}
        options={{
          chart: {
            type: 'donut',
            toolbar: { show: false },
            animations: { enabled: false },
            fontFamily: FONT_FAMILY,
          },
          labels: summary.map((entry) => EXECUTION_STATUS_LABELS[entry.status]),
          colors: summary.map((entry) => STATUS_COLORS[entry.status]),
          dataLabels: {
            enabled: true,
            formatter: (percentage: number) => `${percentage.toFixed(0)}%`,
            style: { fontFamily: FONT_FAMILY, fontSize: '12px', fontWeight: 600 },
            dropShadow: { enabled: false },
          },
          legend: {
            position: 'right',
            fontFamily: FONT_FAMILY,
            fontSize: '13px',
            formatter: (label, options) => {
              const count = summary[options.seriesIndex]?.count ?? 0
              return `${label}: ${count}`
            },
          },
          plotOptions: {
            pie: {
              donut: {
                size: '66%',
                labels: {
                  show: true,
                  name: { show: true, offsetY: 18 },
                  value: { show: true, offsetY: -12, fontSize: '30px', fontWeight: 700 },
                  total: {
                    show: true,
                    showAlways: true,
                    label: 'Ongoing projects',
                    formatter: () => String(total),
                  },
                },
              },
            },
          },
          stroke: { colors: ['var(--surface-card)'], width: 3 },
          tooltip: {
            y: { formatter: (value: number) => `${value} project${value === 1 ? '' : 's'}` },
          },
          responsive: [
            {
              breakpoint: 700,
              options: { legend: { position: 'bottom' } },
            },
          ],
        }}
      />
    </div>
  )
}
