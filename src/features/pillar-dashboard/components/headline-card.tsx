import type { PillarHeadlineCard } from '@/api/schemas/pillar-dashboard'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { ValidationBadge } from '@/components/ui/validation-badge'

/**
 * One headline card, rendered straight from a real KpiProfile — `kpiId`
 * links back to the same indicator in KPI Explorer.
 */
export function HeadlineCard({ card }: { card: PillarHeadlineCard }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-text-subtle">{card.kpiId}</span>
        <InfoPopover
          provenance={card.provenance}
          label={card.title}
          details={[{ label: 'Target', value: card.targetLabel }]}
        />
      </div>

      <p title={card.title} className="mt-2 line-clamp-2 min-h-9 text-sm text-text-muted">
        {card.title}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="text-3xl leading-none font-semibold tracking-tight text-text-default">
          {card.value}
        </span>
        {card.trend && <TrendIndicator trend={card.trend} />}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <p className="line-clamp-1 text-xs text-text-muted">{card.targetLabel}</p>
        <ValidationBadge status={card.validationStatus} />
      </div>
    </Card>
  )
}
