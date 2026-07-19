import { ProgressBar } from '@/components/ui/progress-bar'
import { Sparkline } from '@/components/ui/sparkline'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { cn } from '@/lib/utils'
import { MetricCardFrame } from './metric-card-frame'
import type {
  AccessRateCard,
  EscalationsCard,
  GenerationCapacityCard,
  HeadlineCards as HeadlineCardsData,
  MilestoneDeliveryCard,
} from '../types'

/**
 * Section A of the page specification — exactly four headline cards.
 *
 * The specification states "only four cards appear at the top", so this
 * renders a fixed set of four named cards rather than mapping an array. A
 * fifth card cannot be added by accident.
 *
 * TEXT BUDGET: each card shows its value plus at most one supporting line.
 * Definitions, methodology, baselines, targets and sources all live behind the
 * information icon — that is what the specification put it there for. Adding a
 * fourth line of prose to a card is a signal it belongs in the popover.
 */
export function HeadlineCards({ cards }: { cards: HeadlineCardsData }) {
  return (
    <section aria-label="Headline metrics" className="grid gap-4 xl:grid-cols-4">
      <MilestoneDelivery data={cards.milestoneDelivery} />
      <AccessRate data={cards.accessRate} />
      <GenerationCapacity data={cards.generationCapacity} />
      <Escalations data={cards.escalations} />
    </section>
  )
}

/** A1. Priority milestones delivered on time. */
function MilestoneDelivery({ data }: { data: MilestoneDeliveryCard }) {
  return (
    <MetricCardFrame
      title={data.title}
      icon={data.icon}
      source={data.source}
      provenance={data.provenance}
      details={[
        { label: 'Target', value: data.targetLabel },
        { label: 'Baseline', value: data.baselineLabel },
      ]}
    >
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-text-default">
          {data.percentComplete}%
        </span>
        {data.trend && <TrendIndicator trend={data.trend} />}
      </div>

      <ProgressBar
        value={data.percentComplete}
        label={data.title}
        className="mt-3"
      />

      {/* Counts only. The baseline and target are in the popover. */}
      <p className="mt-2 text-xs text-text-muted">
        {data.breakdown
          .map((entry) => `${entry.count} ${entry.label}`)
          .join(' • ')}
      </p>
    </MetricCardFrame>
  )
}

/** A2. Latest official national electricity access rate. */
function AccessRate({ data }: { data: AccessRateCard }) {
  return (
    <MetricCardFrame
      title={data.title}
      icon={data.icon}
      source={data.source}
      provenance={data.provenance}
      details={[
        { label: 'Target', value: data.targetLabel },
        { label: 'Previous publication', value: data.previousPublication },
      ]}
    >
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-text-default">
          {data.value}
        </span>
        {/*
          The specification requires the source year to be visible at all
          times: this is an annual official publication and must never be read
          as current-period data.
        */}
        <span className="rounded-pill bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-muted">
          {data.sourceYear}
        </span>
      </div>

      {data.trend && <TrendIndicator trend={data.trend} className="mt-3 self-start" />}
    </MetricCardFrame>
  )
}

/** A3. Available generation capacity, against installed, with a sparkline. */
function GenerationCapacity({ data }: { data: GenerationCapacityCard }) {
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
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight text-text-default">
            {data.value}
          </span>
          <span className="text-sm text-text-muted">{data.benchmarkLabel}</span>
        </div>
        <Sparkline points={data.sparkline} className="shrink-0 text-brand-500" />
      </div>

      {data.trend && <TrendIndicator trend={data.trend} className="mt-3 self-start" />}
    </MetricCardFrame>
  )
}

/** A4. Critical escalations requiring leadership attention. */
function Escalations({ data }: { data: EscalationsCard }) {
  // Zero unresolved escalations is the target state, so present it calmly
  // rather than as an alert.
  const isClear = data.unresolvedCritical === 0 && data.overdueDecisions === 0

  return (
    <MetricCardFrame
      title={data.title}
      icon={data.icon}
      source={data.source}
      provenance={data.provenance}
      tone={isClear ? 'default' : 'alert'}
      details={[{ label: 'Target', value: data.targetLabel }]}
    >
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={cn(
            'text-4xl font-semibold tracking-tight',
            isClear ? 'text-status-on-track' : 'text-status-at-risk',
          )}
          // Screen readers otherwise hear a bare number with no unit.
          aria-label={`${data.unresolvedCritical} unresolved critical escalations`}
        >
          {data.unresolvedCritical}
        </span>
        {data.trend && <TrendIndicator trend={data.trend} />}
      </div>

      <p className="mt-3 text-xs text-text-muted">
        {data.overdueDecisions} overdue · longest {data.longestDaysUnresolved}d
      </p>
    </MetricCardFrame>
  )
}
