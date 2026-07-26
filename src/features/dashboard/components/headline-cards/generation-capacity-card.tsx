import { Sparkline } from '@/components/ui/sparkline'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { cn } from '@/lib/utils'
import { MetricCardFrame } from '../metric-card-frame'
import type { GenerationCapacityCard as GenerationCapacityCardData } from '../../types'
import { HEADLINE_VALUE } from './headline-value'

/** A3. Available generation capacity, against installed, with a sparkline. */
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
      details={[
        {
          label: 'Availability ratio',
          value: `${data.availabilityRatio.toFixed(1)}% of installed capacity`,
        },
        { label: 'Benchmark', value: data.benchmarkLabel },
      ]}
    >
      {/*
        The value and the benchmark sit on one line and the sparkline takes its
        own row. Squeezing all three onto one row broke "5.4 GW" across lines.
      */}
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={cn(HEADLINE_VALUE, 'text-text-default')}>
          {data.value}
        </span>
        <span className="truncate text-sm text-text-muted">
          {data.benchmarkLabel}
        </span>
      </div>

      <Sparkline
        points={data.sparkline}
        className="mt-3 h-7 w-full text-brand-500"
      />

      {data.trend && (
        <div className="mt-auto pt-3">
          <TrendIndicator trend={data.trend} />
        </div>
      )}
    </MetricCardFrame>
  )
}
