import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the KPI Explorer page, shaped like the real layout
 * so the page does not jump when data arrives. */
export function KpiExplorerSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading KPI Explorer"
      className="flex flex-col gap-4"
    >
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-14 w-full rounded-card" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-card" />
      <Skeleton className="h-72 w-full rounded-card" />
    </div>
  )
}
