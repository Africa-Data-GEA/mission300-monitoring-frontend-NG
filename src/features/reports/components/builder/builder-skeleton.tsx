import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the Report Builder's two-pane layout. */
export function BuilderSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading report builder" className="flex flex-col gap-4 lg:flex-row">
      <Skeleton className="h-64 w-full shrink-0 rounded-card lg:h-[600px] lg:w-80" />
      <Skeleton className="h-[600px] flex-1 rounded-card" />
    </div>
  )
}
