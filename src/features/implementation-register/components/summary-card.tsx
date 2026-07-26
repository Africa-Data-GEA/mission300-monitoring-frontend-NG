import type { RegisterSummaryCard } from '@/api/schemas/implementation-register'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { MetricIcon } from '@/config/metric-icons'

/** A1. Active programmes and projects, counted separately. */
export function SummaryCard({ data }: { data: RegisterSummaryCard }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
          <MetricIcon name={data.icon} className="size-4 text-brand-600" />
        </span>
        <InfoPopover
          provenance={data.provenance}
          label={data.title}
          details={[
            { label: 'New this cycle', value: String(data.newThisCycle) },
            { label: 'Closed this cycle', value: String(data.closedThisCycle) },
          ]}
        />
      </div>

      <p title={data.title} className="mt-3 line-clamp-2 min-h-9 text-sm text-text-muted">
        {data.title}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <div>
          <span className="text-3xl leading-none font-semibold tracking-tight text-text-default">
            {data.activeProgrammes}
          </span>
          <p className="mt-1 text-xs text-text-muted">Programmes</p>
        </div>
        <div>
          <span className="text-3xl leading-none font-semibold tracking-tight text-text-default">
            {data.activeProjects}
          </span>
          <p className="mt-1 text-xs text-text-muted">Projects</p>
        </div>
      </div>

      {data.trend && (
        <div className="mt-auto pt-3">
          <TrendIndicator trend={data.trend} />
        </div>
      )}
    </Card>
  )
}
