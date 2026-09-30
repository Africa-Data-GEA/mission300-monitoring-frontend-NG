import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the Executive Overview, shaped like the real layout
 * so the page does not jump when data arrives. */
export function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading Executive Overview"
      className="flex flex-col gap-4"
    >
      <div>
        <p className="text-3xl font-semibold tracking-tight text-text-default">
          Executive Overview
        </p>
        <p className="mt-1 text-sm text-text-muted" role="status">
          Loading overview data…
        </p>
      </div>
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
