import { TrendIndicator } from '@/components/ui/trend-indicator'
import { cn } from '@/lib/utils'
import { MetricCardFrame } from '../metric-card-frame'
import type { AccessRateCard as AccessRateCardData } from '../../types'
import { AccessRateLineChart } from './access-rate-line-chart'
import { HEADLINE_VALUE } from './headline-value'
import { ReportingPeriodPill } from './reporting-period-pill'

/** A2. Latest official national electricity access rate. */
export function AccessRateCard({ data }: { data: AccessRateCardData }) {
  return (
    <MetricCardFrame
      title={data.title}
      source={data.source}
      provenance={data.provenance}
      hideSource
      details={[
        { label: 'Target', value: data.targetLabel },
        { label: 'Previous publication', value: data.previousPublication },
      ]}
    >
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className={cn(HEADLINE_VALUE, 'text-text-default')}>
          {data.value}
        </span>
        {/*
          The specification requires the source year to be visible at all
          times: this is an annual official publication and must never be read
          as current-period data.
        */}
        <ReportingPeriodPill period={data.sourceYear} />
      </div>

      {data.sparkline.length >= 2 && <AccessRateLineChart points={data.sparkline} />}

      {data.trend && (
        <div className="mt-auto pt-3">
          <TrendIndicator trend={data.trend} />
        </div>
      )}
    </MetricCardFrame>
  )
}
