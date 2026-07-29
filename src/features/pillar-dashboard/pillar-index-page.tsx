import { Link } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { PILLARS, PILLAR_LABELS } from '@/types/domain'

/** Picker for the six Compact pillar dashboards. */
export function PillarIndexPage() {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb
          items={[{ label: 'Monitoring & Analysis' }, { label: 'Compact pillar dashboards' }]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          Compact pillar dashboards
        </h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Card key={pillar} className="p-4">
            <Link
              to={`/pillars/${pillar}`}
              className="font-medium text-text-default hover:text-brand-700 hover:underline"
            >
              {PILLAR_LABELS[pillar]}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
