import { useParams } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { BottleneckPanel } from './components/bottleneck-panel'
import { DeliveryStatusPanel } from './components/delivery-status-panel'
import { HeadlineCardsSection } from './components/headline-cards-section'
import { KpiPerformanceChart } from './components/kpi-performance-chart'
import { PillarDashboardSkeleton } from './components/pillar-dashboard-skeleton'
import { PillarKpiList } from './components/pillar-kpi-list'
import { usePillarDashboardPage } from './use-pillar-dashboard-page'

/**
 * A Compact pillar dashboard.
 *
 * Per docs/database-structure.md, this page has no data of its own: the
 * headline cards are real KPI Explorer profiles selected for this pillar,
 * and the delivery/bottleneck panel is Programs and Bottlenecks records
 * filtered by the same `pillar` field they already carry. Reads as an
 * analysis rather than a bare list — headline cards carry their own
 * progress-to-target bar, a chart compares current value against target
 * across the four headline KPIs, delivery status and bottleneck severity
 * render as charts, and the full KPI catalogue gets a readiness/validation
 * distribution above the table — the same treatment Executive Overview
 * gives its own sections.
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

      <HeadlineCardsSection cards={data.headlineCards} />

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Card variant="well" className="p-4">
          <h2 className="text-lg font-semibold text-text-default">
            Progress against target
          </h2>
          <div className="mt-3">
            <KpiPerformanceChart cards={data.headlineCards} />
          </div>
        </Card>

        <DeliveryStatusPanel status={data.deliveryStatus} />
      </div>

      <PillarKpiList rows={data.kpis} />
      <BottleneckPanel records={data.bottlenecks} />
    </div>
  )
}
