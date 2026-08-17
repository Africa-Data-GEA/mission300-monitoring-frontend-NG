import { ChevronRight } from 'lucide-react'
import type { PillarId } from '@/api/schemas/common'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'

/**
 * Mission 300's own "National Energy Compact Journey from Inception to
 * Impact" — the CDMU Convening slide deck's Theory of Change (Session 20,
 * "Strategic Overview of M300"). Reproduced from that source rather than
 * invented: stakeholder feedback asked whether indicator categories (Output,
 * Outcome, etc.) tie to a published results framework, and this is that
 * framework — its four stages map closely to the KPI Matrix's own category
 * taxonomy shown just below in the Indicators panel.
 */
const STAGES = [
  {
    label: 'Activities / Outputs',
    detail: 'Compact developed → government ratification → CDMU established → priority actions identified',
  },
  {
    label: 'Short-term outcome',
    detail: 'CDMU functions effectively, mobilizes technical assistance, reforms move into implementation',
  },
  {
    label: 'Intermediate outcomes',
    detail: 'Delivery readiness strengthened, financing aligned and unlocked, results delivered',
  },
  {
    label: 'Long-term outcomes & impact',
    detail: '300 million additional people with electricity access by 2030',
  },
] as const

/** The five M300 pillars from the slide's impact stage map onto this app's
 * six pillar IDs — last-mile-access and clean-cooking share one slide
 * pillar ("Scaled last-mile access & clean cooking"). */
const PILLAR_IMPACT_STATEMENT: Record<PillarId, string> = {
  'generation-network': 'Pillar 1 — Strengthened and expanded grid infrastructure',
  'regional-integration': 'Pillar 2 — Enhanced regional integration and power trade',
  'last-mile-access': 'Pillar 3 — Scaled last-mile access and clean cooking',
  'clean-cooking': 'Pillar 3 — Scaled last-mile access and clean cooking',
  'private-sector-participation': 'Pillar 4 — Increased private investment mobilized',
  'financially-viable-utilities': 'Pillar 5 — Improved utility financial and operational viability',
}

export function TheoryOfChangePanel({ pillar }: { pillar: PillarId }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-1.5">
        <h2 className="text-sm font-semibold text-text-default">Where this pillar sits in Mission 300&apos;s Theory of Change</h2>
        <InfoPopover
          label="About the Mission 300 Theory of Change"
          provenance={{
            definition:
              'Mission 300’s own logic model, from inception (a country signs an Energy Compact) through to impact ' +
              '(300 million additional people with electricity access by 2030). Indicator categories on this dashboard ' +
              '(Output, Outcome, System Performance, Financial and similar) broadly follow this same Activities/Outputs ' +
              '→ Outcomes → Impact staging.',
            methodology: 'Reproduced as presented, not re-derived or estimated.',
            source: 'CDMU Convening slides, Session 20 — "Strategic Overview of Mission 300 Monitoring, Reporting & Learning".',
            lastUpdated: '2026-05-14T00:00:00Z',
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-stretch gap-1.5">
        {STAGES.map((stage, index) => {
          const isImpact = index === STAGES.length - 1
          return (
            <div className="flex items-stretch gap-1.5" key={stage.label}>
              <div
                className={
                  isImpact
                    ? 'flex w-48 flex-col justify-center rounded-control border border-brand-700 bg-brand-50 p-2.5'
                    : 'flex w-40 flex-col justify-center rounded-control bg-surface-sunken p-2.5'
                }
              >
                <p className={isImpact ? 'text-xs font-semibold text-brand-700' : 'text-xs font-semibold text-text-default'}>
                  {stage.label}
                </p>
                <p className="mt-1 text-2xs text-text-muted">{stage.detail}</p>
                {isImpact && (
                  <p className="mt-1.5 border-t border-brand-200 pt-1.5 text-2xs font-medium text-brand-700">
                    {PILLAR_IMPACT_STATEMENT[pillar]}
                  </p>
                )}
              </div>
              {!isImpact && (
                <ChevronRight aria-hidden="true" className="my-auto size-4 shrink-0 text-text-subtle" />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
