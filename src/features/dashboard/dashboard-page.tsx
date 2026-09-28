import { useGlobalFilters } from '@/app/global-filters'
import { useQueryClient } from '@tanstack/react-query'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { useExecutiveOverview } from './api'
import { AccessDeliverySection } from './components/access-delivery-section'
import { CprTargetsPanel } from './components/cpr-targets-panel'
import { DashboardSkeleton } from './components/dashboard-skeleton'
import { DeliveryStatusSection } from './components/delivery-status-section'
import { HeadlineCards } from './components/headline-cards/headline-cards'
import { NationalPerformanceSection } from './components/national-performance/national-performance-section'
import { RegionalPerformanceSection } from './components/regional-performance-section'

/**
 * Executive Overview — the Compact's leadership view.
 *
 * Structure follows the page specification section by section:
 *   A. Headline cards            docs/specs/executive-overview.md
 *   B. Access delivery by channel
 *   C. National performance and target progress
 *   D. Delivery status, bottlenecks and decisions
 *   E. Filters
 *
 * Dynamic pillar behaviour is server-driven: selecting a pillar changes the
 * query, and the API returns a payload recalculated for that pillar. The page
 * does not filter client-side, because the specification requires the delivery
 * card to *recalculate* and the middle cards to *change metric* — neither of
 * which is a subset of the All Pillars payload.
 */
export function DashboardPage() {
  const queryClient = useQueryClient()
  function refreshDelivery() {
    for (const key of ['dashboard', 'bottlenecks', 'programs', 'pillar-dashboard']) {
      void queryClient.invalidateQueries({ queryKey: [key] })
    }
  }
  // The filter bar lives in the shell; this page simply queries with whatever
  // the application-wide selection currently is.
  const { filters } = useGlobalFilters()

  const { data, isPending, isError, error, refetch, isFetching } =
    useExecutiveOverview(filters)

  if (isPending) return <DashboardSkeleton />
  if (isError) {
    return (
      <ErrorState
        title="Executive Overview could not be loaded"
        message={error.message}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Monitoring & Analysis' },
            { label: 'Executive Overview' },
          ]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          Executive Overview
        </h1>
      </div>

      {/*
        Kept mounted while refetching so changing a filter does not blank the
        page; the region is marked busy instead.
      */}
      <div aria-busy={isFetching} className="flex flex-col gap-4">
        <CprTargetsPanel targets={data.cprTargets} />
        <HeadlineCards cards={data.headlineCards} />
        <AccessDeliverySection channels={data.accessDelivery} />
        <NationalPerformanceSection metrics={data.nationalPerformance} />
        <RegionalPerformanceSection />
        <DeliveryStatusSection panel={data.deliveryStatus} onProjectsChanged={refreshDelivery} />
      </div>
    </div>
  )
}
