import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the Programs page. */
export function ProgramsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading programmes" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-36 w-full max-w-sm rounded-card" />
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  )
}
