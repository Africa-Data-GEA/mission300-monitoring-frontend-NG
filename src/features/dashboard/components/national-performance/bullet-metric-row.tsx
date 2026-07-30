import { BulletChart } from '@/components/ui/bullet-chart'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { BulletMetric } from '../../types'

function conciseDataSource(source: string): string {
  const normalized = source.toUpperCase()

  if (normalized.includes('NERC')) return 'NERC'
  if (normalized.includes('NIGERIA NATIONAL ENERGY COMPACT')) {
    return 'Nigeria National Energy Compact'
  }
  if (normalized.includes('RURAL ELECTRIFICATION AGENCY')) return 'REA'
  if (normalized.includes('NISO') && normalized.includes('TCN')) return 'NISO / TCN'
  if (normalized.includes('NISO')) return 'NISO'
  if (normalized.includes('TCN')) return 'TCN'

  return source.replace(/[.;].*$/, '').trim()
}

/** One Section C metric: value, trend and its bullet chart. */
export function BulletMetricRow({ metric }: { metric: BulletMetric }) {
  return (
    <Card className="relative flex h-full flex-col p-4 transition-[border-color,box-shadow] hover:z-20 hover:border-brand-200 hover:shadow-sm focus-within:z-20">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-text-default">{metric.title}</h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <InfoPopover
            provenance={metric.provenance}
            label={metric.title}
            sourceLabel={conciseDataSource(metric.provenance.source)}
            details={[
              { label: 'Target', value: metric.targetLabel },
              { label: 'Note', value: metric.caption },
            ]}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-2xl font-semibold tracking-tight text-text-default">
          {metric.value}
        </span>
        {metric.trend && <TrendIndicator trend={metric.trend} />}
      </div>

      <BulletChart
        className="mt-3"
        current={metric.current}
        baseline={metric.baseline}
        expected={metric.expected}
        target={metric.target}
        scaleMin={metric.scaleMin}
        scaleMax={metric.scaleMax}
        direction={metric.direction}
        label={metric.title}
        valueLabel={metric.value}
        showBaseline={false}
        showExpected={false}
      />
    </Card>
  )
}
