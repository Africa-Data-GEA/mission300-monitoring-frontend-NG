import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder shaped like the real layout, matching the convention
 * every other single-query page in the app uses (see DashboardSkeleton). */
export function InstitutionOverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading institution overview" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-40 w-full rounded-card" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-card" />
      <Skeleton className="h-56 w-full rounded-card" />
    </div>
  )
}
