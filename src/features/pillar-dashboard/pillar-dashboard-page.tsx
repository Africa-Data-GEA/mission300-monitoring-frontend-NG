import { useParams } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { BottleneckPanel } from './components/bottleneck-panel'
import { DeliveryStatusPanel } from './components/delivery-status-panel'
import { PillarDashboardSkeleton } from './components/pillar-dashboard-skeleton'
import { PillarKpiList } from './components/pillar-kpi-list'
import { usePillarDashboardPage } from './use-pillar-dashboard-page'

/**
 * A Compact pillar dashboard.
 *
 * Per docs/database-structure.md, this page has no data of its own: the
 * headline cards are real KPI Explorer profiles selected for this pillar,
 * and the delivery/bottleneck panel is Programs and Bottlenecks records
 * filtered by the same `pillar` field they already carry. Scope for this
 * pass is Section A (headline cards) and a delivery/bottleneck panel; the
 * bespoke per-pillar diagnostic sections in docs/specs/ are a follow-up.
 */
export function PillarDashboardPage() {
  const pillarParam = useParams().pillar ?? ''
  const page = usePillarDashboardPage(pillarParam)

  if (page.isPending) return <PillarDashboardSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Pillar dashboard could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.data) return null

  const { data } = page

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Monitoring & Analysis' },
            { label: 'Compact pillar dashboards' },
            { label: data.label },
          ]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          {data.label}
        </h1>
      </div>

      {/* <HeadlineCardsSection cards={data.headlineCards} /> */}
      <DeliveryStatusPanel status={data.deliveryStatus} />
      <PillarKpiList rows={data.kpis} />
      <BottleneckPanel records={data.bottlenecks} />
    </div>
  )
}
