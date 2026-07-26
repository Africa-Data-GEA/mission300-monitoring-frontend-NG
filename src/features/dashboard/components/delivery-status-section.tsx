import { Link } from 'react-router'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { SeverityBadge } from '@/components/ui/status-badge'
import {
  StackedStatusBar,
  StatusLegend,
} from '@/components/ui/stacked-status-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { DeliveryStatus } from '@/types/domain'
import type { DeliveryStatusPanel } from '../types'

/**
 * Section D — Delivery Status, Bottlenecks and Decisions.
 *
 * One linked split panel: priority delivery status by pillar as horizontal
 * stacked bars, beside a ranked exception table. The specification caps the
 * table at five records and requires a View All action into the Bottlenecks
 * and Exceptions module.
 */
const MAX_VISIBLE_EXCEPTIONS = 5

const LEGEND_STATUSES: readonly DeliveryStatus[] = [
  'completed',
  'on-track',
  'at-risk',
  'delayed',
  'blocked',
]

export function DeliveryStatusSection({ panel }: { panel: DeliveryStatusPanel }) {
  // Enforced here rather than trusted to the API, so an over-long response
  // cannot break the layout.
  const visible = panel.exceptions.slice(0, MAX_VISIBLE_EXCEPTIONS)

  return (
    <Card variant="well" className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-default">
            Delivery status, bottlenecks and decisions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {panel.trend && <TrendIndicator trend={panel.trend} />}
          <InfoPopover
            provenance={panel.provenance}
            label="Delivery status and exceptions"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.1fr_1fr]">
        {/* Pillar delivery status */}
        <Card className="p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-default">
              Priority delivery status by pillar
            </h3>
            <StatusLegend statuses={LEGEND_STATUSES} />
          </div>

          <ul aria-label="Priority delivery status by pillar" className="mt-4 space-y-3.5">
            {panel.pillars.map((pillar) => (
              <li key={pillar.pillar}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-text-default">
                    {pillar.label}
                  </span>
                  <span className="text-xs text-text-muted">
                    {pillar.total} record{pillar.total === 1 ? '' : 's'}
                  </span>
                </div>
                <StackedStatusBar
                  className="mt-1.5"
                  counts={pillar.counts}
                  total={pillar.total}
                  label={pillar.label}
                />
              </li>
            ))}
          </ul>
        </Card>

        {/* Ranked exceptions */}
        <Card className="flex flex-col p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-default">
              Priority exceptions
            </h3>
            <Link
              to="/bottlenecks"
              className="text-xs font-medium text-link underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          <ul
            aria-label="Priority exceptions"
            className="mt-3 divide-y divide-border-default"
          >
            {visible.map((exception) => (
              <li key={exception.id} className="flex items-start gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-default">
                    {exception.title}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {exception.category} • {exception.institution} •{' '}
                    {exception.reference} • {exception.daysUnresolved} days
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <SeverityBadge severity={exception.severity} />
                  <InfoPopover
                    provenance={exception.provenance}
                    label={exception.title}
                  />
                </div>
              </li>
            ))}
          </ul>

          {visible.length === 0 && (
            <p className="mt-3 text-sm text-status-on-track">
              No unresolved priority exceptions.
            </p>
          )}
        </Card>
      </div>
    </Card>
  )
}
