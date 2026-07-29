import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the Reports & Exports page. */
export function ReportsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading Reports & Exports" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-64 w-full rounded-card" />
      <Skeleton className="h-56 w-full rounded-card" />
      <Skeleton className="h-72 w-full rounded-card" />
    </div>
  )
}
