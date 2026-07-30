import Chart from 'react-apexcharts'
import {
  READINESS_LABELS,
  VALIDATION_LABELS,
  type KpiCatalogueRow,
  type ReadinessTier,
  type ValidationStatus,
} from '@/api/schemas/kpi-explorer'
import { Card } from '@/components/ui/card'
import { CHART_BLUE_SCALE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

function countBy<T extends string>(rows: readonly KpiCatalogueRow[], key: 'readiness' | 'validationStatus') {
  const counts = new Map<T, number>()
  for (const row of rows) {
    const value = row[key] as T
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return counts
}

function DistributionDonut({
  title,
  counts,
  labels,
}: {
  title: string
  counts: Map<string, number>
  labels: Record<string, string>
}) {
  const entries = [...counts.entries()].filter(([, count]) => count > 0)
  const total = entries.reduce((sum, [, count]) => sum + count, 0)

  if (total === 0) {
    return (
      <Card className="flex items-center justify-center p-4 text-sm text-text-muted">
        No indicators to chart.
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-default">{title}</h3>
      <Chart
        type="donut"
        height={260}
        series={entries.map(([, count]) => count)}
        options={{
          chart: { type: 'donut', toolbar: { show: false }, fontFamily: FONT_FAMILY },
          labels: entries.map(([key]) => labels[key] ?? key),
          colors: CHART_BLUE_SCALE.slice(0, entries.length),
          dataLabels: {
            enabled: true,
            formatter: (percentage: number) => `${percentage.toFixed(0)}%`,
            style: { fontFamily: FONT_FAMILY, fontSize: '11px', fontWeight: 600 },
            dropShadow: { enabled: false },
          },
          legend: { position: 'bottom', fontFamily: FONT_FAMILY, fontSize: '11px' },
          plotOptions: {
            pie: {
              donut: {
                size: '66%',
                labels: {
                  show: true,
                  name: { show: true, offsetY: 12 },
                  value: { show: true, offsetY: -8, fontSize: '20px', fontWeight: 700 },
                  total: { show: true, showAlways: true, label: 'Total', formatter: () => String(total) },
                },
              },
            },
          },
          stroke: { colors: ['var(--surface-card)'], width: 3 },
        }}
      />
    </Card>
  )
}

/**
 * Turns the pillar's KPI catalogue from a bare list into a quick read of how
 * mature and how trustworthy its indicators currently are — the readiness
 * tier (is it even measured yet) and the validation status (can the current
 * value be trusted) are the two catalogue facts an analyst actually needs
 * before reading the table row by row.
 */
export function KpiDistributionCharts({ rows }: { rows: readonly KpiCatalogueRow[] }) {
  const readinessCounts = countBy<ReadinessTier>(rows, 'readiness')
  const validationCounts = countBy<ValidationStatus>(rows, 'validationStatus')

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DistributionDonut title="Indicators by readiness tier" counts={readinessCounts} labels={READINESS_LABELS} />
      <DistributionDonut title="Indicators by validation status" counts={validationCounts} labels={VALIDATION_LABELS} />
    </div>
  )
}
