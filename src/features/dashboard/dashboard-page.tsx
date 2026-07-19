import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useExecutiveOverview } from './api'
import { AccessDeliverySection } from './components/access-delivery-section'
import { DeliveryStatusSection } from './components/delivery-status-section'
import { FilterBar, type FilterValues } from './components/filter-bar'
import { HeadlineCards } from './components/headline-cards'
import { NationalPerformanceSection } from './components/national-performance-section'

const DEFAULT_FILTERS: FilterValues = {
  period: 'q3-2025',
  pillar: 'all',
  institution: 'all',
  priority: 'priority',
  geographicScope: 'national',
  distributionCompany: 'all',
  technology: 'all',
}

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
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const { data, isPending, isError, error, refetch, isFetching } =
    useExecutiveOverview(filters)

  if (isPending) return <DashboardSkeleton />
  if (isError) return <DashboardError message={error.message} onRetry={refetch} />

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        filters={data.filters}
        value={filters}
        onChange={setFilters}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        lastUpdated={data.lastUpdated}
      />

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
        <HeadlineCards cards={data.headlineCards} />
        <AccessDeliverySection channels={data.accessDelivery} />
        <NationalPerformanceSection metrics={data.nationalPerformance} />
        <DeliveryStatusSection panel={data.deliveryStatus} />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading Executive Overview"
      className="flex flex-col gap-4"
    >
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-52 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-44 w-full rounded-card" />
      <Skeleton className="h-96 w-full rounded-card" />
      <Skeleton className="h-80 w-full rounded-card" />
    </div>
  )
}

function DashboardError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card className="p-8 text-center" role="alert">
      <h1 className="text-lg font-semibold text-text-default">
        Executive Overview could not be loaded
      </h1>
      <p className="mx-auto mt-2 max-w-prose text-sm text-text-muted">{message}</p>
      <Button onClick={onRetry} className="mt-5">
        Try again
      </Button>
    </Card>
  )
}
