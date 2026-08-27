import { Link } from 'react-router'
import { BulletChart } from '@/components/ui/bullet-chart'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { cn } from '@/lib/utils'
import type { CompactOutcomeCard as CompactOutcomeCardData } from '../../types'
import { MetricCardFrame } from '../metric-card-frame'
import { HEADLINE_VALUE } from './headline-value'
import { ReportingPeriodPill } from './reporting-period-pill'

/** A Mission 300 outcome with an official baseline, current value and 2030 target. */
export function CompactOutcomeCard({
  data,
}: {
  data: CompactOutcomeCardData
}) {
  return (
    <MetricCardFrame
      title={data.title}
      source={data.source}
      provenance={data.provenance}
      hideSource
      details={[
        { label: 'Reporting period', value: data.reportingPeriod },
        { label: 'Baseline', value: data.baselineLabel },
        { label: '2030 target', value: data.targetLabel },
        {
          label: 'Interim checkpoints',
          value:
            data.milestones.length > 0
              ? data.milestones.map((m) => `${m.label}: ${m.value}`).join('; ')
              : null,
        },
      ]}
    >
      {/*
        SHARED SHAPE. All four Section A cards run value row → visual → trend,
        with the trend pinned to the bottom by `mt-auto`. This card used to
        carry its trend inline on the value row, so across the row of four the
        trend badges sat at two different heights and the eye had nowhere to
        track along. It also left this card with no element claiming the
        leftover height, so the bullet rail floated mid-card while the two
        sparkline cards beside it filled to the bottom edge.
      */}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className={cn(HEADLINE_VALUE, 'text-text-default')}>
          {data.value}
        </span>
        <ReportingPeriodPill period={data.reportingPeriod} />
      </div>

      {/*
        `expected={null}` here is a presentation choice — a headline card plots
        current against baseline and target only — not a statement that the
        metric has no approved trajectory. `showExpected` must therefore be
        false: left at its default the chart reads the null back and captions
        the tooltip "No approved trajectory", which asserts something about
        Mission 300's plan that this card has no basis to claim.
      */}
      <BulletChart
        className="mt-3"
        current={data.current}
        baseline={data.baseline}
        expected={null}
        showExpected={false}
        target={data.target}
        scaleMin={data.scaleMin}
        scaleMax={data.scaleMax}
        direction={data.direction}
        label={data.title}
        valueLabel={data.value}
        milestones={data.milestones}
      />

      {data.trend && (
        <div className="mt-auto pt-3">
          <TrendIndicator trend={data.trend} />
        </div>
      )}

      {data.relatedKpiNote && (
        <Link
          to={`/kpis?kpi=${data.relatedKpiNote.kpiId}`}
          className="mt-2 block text-xs text-text-muted underline-offset-2 hover:text-brand-700 hover:underline"
        >
          See also — {data.relatedKpiNote.label}: {data.relatedKpiNote.value}
        </Link>
      )}
    </MetricCardFrame>
  )
}
