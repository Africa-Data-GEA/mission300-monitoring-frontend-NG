import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for a Compact pillar dashboard. */
export function PillarDashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading pillar dashboard" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-40 rounded-card" />
        <Skeleton className="h-40 rounded-card" />
        <Skeleton className="h-40 rounded-card" />
        <Skeleton className="h-40 rounded-card" />
      </div>
      <Skeleton className="h-24 w-full rounded-card" />
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  )
}
