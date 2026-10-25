import { Link } from 'react-router'
import type { PillarHeadlineCard } from '@/api/schemas/pillar-dashboard'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { AccessRateLineChart } from '@/features/dashboard/components/headline-cards/access-rate-line-chart'
import { ReportingPeriodPill } from '@/features/dashboard/components/headline-cards/reporting-period-pill'
import { getLocale } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { PillarKpiEditButton } from './pillar-kpi-edit-button'

/** Matches the Executive Overview's headline figures: large counts are
 * abbreviated, percentages carry one decimal place with no space before "%". */
function formatHeadlineValue(value: number, unit: string): string {
  if (unit === '%') return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
  const formatted =
    Math.abs(value) >= 100_000
      ? new Intl.NumberFormat(getLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(value)
      : value.toLocaleString(undefined, { maximumFractionDigits: 1 })
  return unit ? `${formatted} ${unit}` : formatted
}

/**
 * One headline card, rendered straight from a real KpiProfile — the title
 * drills down to the same indicator's full profile in KPI Explorer. Laid out
 * like the Executive Overview's headline cards: the figure with its reporting
 * period, then progress to target where a level target exists or the recent
 * trend line where it does not, and the change against the previous reading.
 */
export function HeadlineCard({ card }: { card: PillarHeadlineCard }) {
  const isPrivateCapital = card.kpiId.startsWith('M300-P4-')
  /**
   * For a higher-is-better indicator, "% to target" is the share of the
   * target level reached.
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

  const hasLevelTarget = card.target !== null
  const sparkline = card.sparkline ?? []
  const growthCommitment = card.targetBasis === 'growth-rate' && card.targetBasisLabel ? card.targetBasisLabel : null
  const showTrendLine = !hasLevelTarget && card.rawValue !== null && sparkline.length >= 2
  const showProgress = hasLevelTarget || (!growthCommitment && !showTrendLine)
  const commitment = growthCommitment ? `${growthCommitment} (a growth rate, not a level)` : card.targetLabel
  const unavailableProgressLabel =
    card.rawValue === null ? 'No reported value yet' : !hasLevelTarget ? 'No confirmed target yet' : 'Target set · progress unavailable'

  const displayValue = card.rawValue !== null ? formatHeadlineValue(card.rawValue, card.unit) : card.value

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
            details={
              isPrivateCapital
                ? []
                : [
                    { label: 'Baseline', value: card.baselineLabel || null },
                    { label: 'Target', value: commitment },
                  ]
            }
          />
          <PillarKpiEditButton kpiId={card.kpiId} name={card.title} />
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span
          className={cn(
            'leading-none font-semibold tracking-tight whitespace-nowrap text-text-default',
            card.rawValue !== null ? 'text-3xl' : 'text-xl',
          )}
        >
          {displayValue}
        </span>
        {card.period && <ReportingPeriodPill period={card.period} />}
      </div>

      {showTrendLine && <AccessRateLineChart points={sparkline} label={card.title} unit={card.unit} />}

      {!isPrivateCapital && growthCommitment && (
        <p className="mt-2 text-2xs text-text-subtle">
          <span className="font-medium text-text-muted">{growthCommitment}</span> · a growth rate, not a level target
        </p>
      )}

      {!isPrivateCapital && showProgress && (
        <div className="mt-3 flex flex-col gap-1">
          <ProgressBar
            barClassName="bg-chart-blue-dark"
            value={percentToTarget ?? 0}
            label={
              percentToTarget !== null ? `${card.title} progress to target` : `${card.title} — ${unavailableProgressLabel}`
            }
          />
          <p className="text-2xs text-text-subtle">
            {percentToTarget !== null
              ? `${Math.round(percentToTarget)}% to target${card.baseline !== null ? ` · baseline ${card.baseline.toLocaleString()}` : ''}`
              : unavailableProgressLabel}
          </p>
        </div>
      )}

      {card.trend && (
        <div className="mt-auto pt-3">
          <TrendIndicator trend={card.trend} />
        </div>
      )}
    </Card>
  )
}
