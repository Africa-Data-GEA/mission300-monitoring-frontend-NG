import { Link } from 'react-router'
import type { PillarHeadlineCard } from '@/api/schemas/pillar-dashboard'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'

/**
 * One headline card, rendered straight from a real KpiProfile — the title
 * drills down to the same indicator's full profile in KPI Explorer.
 */
export function HeadlineCard({ card }: { card: PillarHeadlineCard }) {
  const percentToTarget =
    card.rawValue !== null && card.target !== null && card.target !== 0
      ? (card.rawValue / card.target) * 100
      : null

  // The bare figure only — `card.value` carries a full descriptive label
  // (unit, method, reporting period) meant for the KPI profile it's sourced
  // from, not for a compact headline card where that text just crowds the number.
  // Large raw counts (population, connections) are abbreviated — a 10-digit
  // number blown up at text-3xl reads as a layout bug next to sibling cards
  // showing small percentages or counts in the tens of thousands.
  const displayValue =
    card.rawValue !== null
      ? Math.abs(card.rawValue) >= 100_000
        ? new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(card.rawValue)
        : card.rawValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
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
        <InfoPopover
          provenance={card.provenance}
          label={card.title}
          details={[{ label: 'Target', value: card.targetLabel }]}
        />
      </div>

      <div className="mt-1">
        <span className="text-3xl leading-none font-semibold tracking-tight text-text-default">
          {displayValue}
        </span>
        {card.trend && (
          <div className="mt-1.5">
            <TrendIndicator trend={card.trend} />
          </div>
        )}
      </div>

      {/* Always renders the track, even with no confirmed target, so every
          card in a row ends on the same bottom element — three cards with a
          visible bar and one with silent empty space read as broken, not
          "this one has no target yet". `items-end` + a fixed mt-3 guarantees
          a real gap above the bar even in a short card, rather than relying
          solely on mt-auto (which collapses to ~0 when there's little spare
          height to distribute). */}
      <div className="mt-3 flex flex-1 items-end">
        <ProgressBar
          barClassName="bg-chart-blue-dark"
          value={percentToTarget ?? 0}
          label={
            percentToTarget !== null ? `${card.title} progress to target` : `${card.title} — no confirmed target yet`
          }
        />
      </div>
    </Card>
  )
}
