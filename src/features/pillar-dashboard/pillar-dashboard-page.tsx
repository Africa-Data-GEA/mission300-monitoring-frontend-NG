import { useParams } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { CoreIndicatorsSection } from './components/core-indicators-section'
import { HeadlineCardsSection } from './components/headline-cards-section'
import { PillarDashboardSkeleton } from './components/pillar-dashboard-skeleton'
import { PillarKpiList } from './components/pillar-kpi-list'
import { usePillarDashboardPage } from './use-pillar-dashboard-page'

/**
 * A Compact pillar dashboard.
 *
 * Per docs/database-structure.md, this page has no data of its own: the
 * headline cards and KPI table are real KPI Explorer profiles selected for
 * this pillar, filtered by the same `pillar` field they already carry.
 * Headline cards carry their own progress-to-target bar, and the full KPI
 * catalogue gets a readiness/validation distribution above the table.
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

      <CoreIndicatorsSection indicators={data.coreIndicators} pillar={data.pillar} />

      <PillarKpiList rows={data.kpis} />
    </div>
  )
}
