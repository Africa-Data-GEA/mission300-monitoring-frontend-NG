import { TrendIndicator } from '@/components/ui/trend-indicator'
import { cn } from '@/lib/utils'
import { MetricCardFrame } from '../metric-card-frame'
import type { GenerationCapacityCard as GenerationCapacityCardData } from '../../types'
import { GenerationCapacityLineChart } from './generation-capacity-line-chart'
import { HEADLINE_VALUE } from './headline-value'

/** A3. Available generation capacity with an Apex line chart. */
export function GenerationCapacityCard({
  data,
}: {
  data: GenerationCapacityCardData
}) {
  return (
    <MetricCardFrame
      title={data.title}
      icon={data.icon}
      source={data.source}
      provenance={data.provenance}
      hideSource
      details={[
        {
          label: 'Availability ratio',
          value: `${data.availabilityRatio.toFixed(1)}% of installed capacity`,
        },
        { label: 'Benchmark', value: data.benchmarkLabel },
      ]}
    >
      <div className="mt-1">
        <span className={cn(HEADLINE_VALUE, 'text-text-default')}>
          {data.value}
        </span>
      </div>

      <GenerationCapacityLineChart points={data.sparkline} />

      {data.trend && (
        <div className="mt-auto pt-3">
          <TrendIndicator trend={data.trend} />
        </div>
      )}
    </MetricCardFrame>
  )
}
