import { BulletChart } from '@/components/ui/bullet-chart'
import { cn } from '@/lib/utils'
import type { CompactOutcomeCard as CompactOutcomeCardData } from '../../types'
import { MetricCardFrame } from '../metric-card-frame'
import { HEADLINE_VALUE } from './headline-value'

/** A Mission 300 outcome with an official baseline, current value and 2030 target. */
export function CompactOutcomeCard({
  data,
}: {
  data: CompactOutcomeCardData
}) {
  return (
    <MetricCardFrame
      title={data.title}
      icon={data.icon}
      source={data.source}
      provenance={data.provenance}
      details={[
        { label: 'Reporting period', value: data.reportingPeriod },
        { label: 'Baseline', value: data.baselineLabel },
        { label: '2030 target', value: data.targetLabel },
      ]}
    >
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className={cn(HEADLINE_VALUE, 'text-text-default')}>
          {data.value}
        </span>
        <span className="rounded-pill bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-muted">
          {data.reportingPeriod}
        </span>
      </div>

      <BulletChart
        className="mt-3"
        current={data.current}
        baseline={data.baseline}
        expected={null}
        target={data.target}
        scaleMin={data.scaleMin}
        scaleMax={data.scaleMax}
        direction={data.direction}
        label={data.title}
        valueLabel={data.value}
      />

      <p className="mt-auto pt-2 text-xs text-text-muted">
        {data.baselineLabel} / {data.targetLabel}
      </p>
    </MetricCardFrame>
  )
}
