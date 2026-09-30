import { Link } from 'react-router'
import type { PillarHeadlineCard } from '@/api/schemas/pillar-dashboard'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { getLocale } from '@/lib/currency'
import { PillarKpiEditButton } from './pillar-kpi-edit-button'

/** Same abbreviation threshold and no-space-before-"%" convention as
 * CoreIndicatorsSection's formatValue/formatCompactValue, kept local since
 * headline cards don't otherwise need currency/NGN unit handling. */
function formatHeadlineValue(value: number, unit: string): string {
  const formatted =
    Math.abs(value) >= 100_000
      ? new Intl.NumberFormat(getLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(value)
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (unit === '%') return `${formatted}%`
  return `${formatted} ${unit}`
}

/**
 * One headline card, rendered straight from a real KpiProfile — the title
 * drills down to the same indicator's full profile in KPI Explorer.
 */
export function HeadlineCard({ card }: { card: PillarHeadlineCard }) {
  const isPrivateCapital = card.kpiId.startsWith('M300-P4-')
  /**
   * For a higher-is-better indicator, "% to target" is the share of the
   * target level reached — the reading this card has always shown.
   *
   * A lower-is-better indicator cannot use that ratio: ATC&C at 34.81%
   * against a 20% target came out as "174% to target" on a full bar,
   * reading as comfortably ahead when it is in fact well short. Progress
   * there is the distance already travelled down from the baseline
   * (45 → 34.81 of the 45 → 20 journey), an honest 41%.
   */
  const percentToTarget = (() => {
    if (card.rawValue === null || card.target === null) return null

    if (card.direction === 'lower-is-better') {
      if (card.baseline === null || card.baseline === card.target) return null
      const travelled = (card.baseline - card.rawValue) / (card.baseline - card.target)
      return Math.max(0, Math.min(100, travelled * 100))
    }

    if (card.target === 0) return null
    return (card.rawValue / card.target) * 100
  })()

  // A commitment stated as a rate of change rather than a level in this
  // indicator's unit — see `targetBasis` on kpiProfileSchema.
  const isGrowthRateTarget = card.targetBasis === 'growth-rate' && Boolean(card.targetBasisLabel)
  const hasLevelTarget = card.target !== null
  const unavailableProgressLabel = !hasLevelTarget
    ? 'No confirmed target yet'
    : card.rawValue === null
      ? 'Target set · awaiting first report'
      : 'Target set · progress unavailable'

  // The figure plus its unit, not `card.value`'s full descriptive label
  // (which also repeats method/reporting period) — that reads as crowded at
  // this card's size, but the bare number without even a "%" or "MW" reads
  // as flatly wrong, so the unit stays. Large raw counts (population,
  // connections) are abbreviated — a 10-digit number blown up at text-3xl
  // reads as a layout bug next to sibling cards showing small percentages or
  // counts in the tens of thousands.
  const displayValue =
    card.rawValue !== null
      ? formatHeadlineValue(card.rawValue, card.unit)
      : card.value

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/kpis?kpi=${card.kpiId}`}
          title={card.title}
          className="line-clamp-2 min-h-9 text-sm text-text-muted underline-offset-2 hover:text-brand-700 hover:underline"
        >
          {card.title}
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <InfoPopover
            provenance={card.provenance}
            label={card.title}
            details={isPrivateCapital ? [] : [
              { label: 'Baseline', value: card.baselineLabel || null },
              { label: 'Target', value: card.targetLabel },
            ]}
          />
          <PillarKpiEditButton kpiId={card.kpiId} name={card.title} />
        </div>
      </div>

      <div className="mt-1">
        <span className="text-3xl leading-none font-semibold tracking-tight text-text-default">
          {displayValue}
        </span>
        {card.period && <span className="ml-1.5 text-2xs text-text-subtle">as of {card.period}</span>}
        {card.trend && (
          <div className="mt-1.5">
            <TrendIndicator trend={card.trend} />
          </div>
        )}
      </div>

      {/* Private-sector target and reporting-period claims are withheld until
          their source is confirmed. Other pillars retain their target display. */}
      {!isPrivateCapital && <div className="mt-3 flex flex-1 flex-col justify-end gap-1">
        {isGrowthRateTarget ? (
          /* A commitment exists but is expressed as a rate of change, so there
             is no level to measure progress against and no honest bar to draw.
             Showing the empty track here would repeat the exact confusion
             review flagged — the card read as having no target when the target
             was simply in another unit. The commitment is stated instead. */
          <p className="rounded-control bg-surface-sunken px-2 py-1.5 text-2xs text-text-muted">
            <span className="font-medium text-text-default">{card.targetBasisLabel}</span>
            {' — a growth rate, not a level. No level target agreed.'}
          </p>
        ) : (
          <>
            <ProgressBar
              barClassName="bg-chart-blue-dark"
              value={percentToTarget ?? 0}
              label={
                percentToTarget !== null ? `${card.title} progress to target` : `${card.title} — ${unavailableProgressLabel}`
              }
            />
            {/* Stakeholder feedback asked for baseline/progress/%-to-target to be
                visible on the scorecard, not only inferable from the bar's fill
                width — this states the percentage as text. */}
            <p className="text-2xs text-text-subtle">
              {percentToTarget !== null
                ? `${Math.round(percentToTarget)}% to target${card.baseline !== null ? ` · baseline ${card.baseline.toLocaleString()}` : ''}`
                : unavailableProgressLabel}
            </p>
          </>
        )}
      </div>}
    </Card>
  )
}
