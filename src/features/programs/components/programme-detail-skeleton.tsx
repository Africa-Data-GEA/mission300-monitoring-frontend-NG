import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for a programme's detail page. */
export function ProgrammeDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading programme" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-32 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  )
}
