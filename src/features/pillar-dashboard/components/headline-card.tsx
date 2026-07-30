import type { PillarHeadlineCard } from '@/api/schemas/pillar-dashboard'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'

/**
 * One headline card, rendered straight from a real KpiProfile — `kpiId`
 * links back to the same indicator in KPI Explorer.
 */
export function HeadlineCard({ card }: { card: PillarHeadlineCard }) {
  const percentToTarget =
    card.rawValue !== null && card.target !== null && card.target !== 0
      ? (card.rawValue / card.target) * 100
      : null

  // The bare figure only — `card.value` carries a full descriptive label
  // (unit, method, reporting period) meant for the KPI profile it's sourced
  // from, not for a compact headline card where that text just crowds the number.
  const displayValue =
    card.rawValue !== null ? card.rawValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : card.value

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <p title={card.title} className="line-clamp-2 min-h-9 text-sm text-text-muted">
          {card.title}
        </p>
        <InfoPopover
          provenance={card.provenance}
          label={card.title}
          details={[{ label: 'Target', value: card.targetLabel }]}
        />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="text-3xl leading-none font-semibold tracking-tight text-text-default">
          {displayValue}
        </span>
        {card.trend && <TrendIndicator trend={card.trend} />}
      </div>

      {percentToTarget !== null && (
        <ProgressBar
          className="mt-3"
          barClassName="bg-[#1d4ed8]"
          value={percentToTarget}
          label={`${card.title} progress to target`}
        />
      )}

      <div className="mt-auto pt-3">
        <p className="line-clamp-1 text-xs text-text-muted">{card.targetLabel}</p>
      </div>
    </Card>
  )
}
