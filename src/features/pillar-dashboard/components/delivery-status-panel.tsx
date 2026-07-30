import Chart from 'react-apexcharts'
import { EXECUTION_STATUS_LABELS, type ExecutionStatus } from '@/api/schemas/programs'
import type { PillarDeliveryStatus } from '@/api/schemas/pillar-dashboard'
import { Card } from '@/components/ui/card'
import { CHART_ACCENT, CHART_BLUE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'
const STATUS_COLORS: Record<ExecutionStatus, string> = {
  'on-track': CHART_BLUE.darkest,
  'at-risk': CHART_BLUE.base,
  delayed: CHART_BLUE.light,
  blocked: CHART_ACCENT,
  completed: CHART_BLUE.lightest,
}

/** Delivery status of this pillar's programmes and projects. */
export function DeliveryStatusPanel({ status }: { status: PillarDeliveryStatus }) {
  const populated = status.counts.filter((entry) => entry.count > 0)

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-text-default">
        Delivery status — programmes and projects
      </h2>

      {status.total === 0 ? (
        <p className="mt-3 text-sm text-text-muted">
          No programmes or projects are currently tagged to this pillar.
        </p>
      ) : (
        <Chart
          type="donut"
          height={280}
          series={populated.map((entry) => entry.count)}
          options={{
            chart: {
              type: 'donut',
              toolbar: { show: false },
              fontFamily: FONT_FAMILY,
            },
            labels: populated.map((entry) => EXECUTION_STATUS_LABELS[entry.status]),
            colors: populated.map((entry) => STATUS_COLORS[entry.status]),
            dataLabels: {
              enabled: true,
              formatter: (percentage: number) => `${percentage.toFixed(0)}%`,
              style: { fontFamily: FONT_FAMILY, fontSize: '11px', fontWeight: 600 },
              dropShadow: { enabled: false },
            },
            legend: {
              position: 'bottom',
              fontFamily: FONT_FAMILY,
              fontSize: '12px',
              formatter: (label, options) => {
                const count = populated[options?.seriesIndex ?? -1]?.count ?? 0
                return `${label}: ${count}`
              },
            },
            plotOptions: {
              pie: {
                donut: {
                  size: '66%',
                  labels: {
                    show: true,
                    name: { show: true, offsetY: 14 },
                    value: { show: true, offsetY: -10, fontSize: '24px', fontWeight: 700 },
                    total: {
                      show: true,
                      showAlways: true,
                      label: 'Total',
                      formatter: () => String(status.total),
                    },
                  },
                },
              },
            },
            stroke: { colors: ['var(--surface-card)'], width: 3 },
            tooltip: {
              y: { formatter: (value: number) => `${value} record${value === 1 ? '' : 's'}` },
            },
          }}
        />
      )}
    </Card>
  )
}
