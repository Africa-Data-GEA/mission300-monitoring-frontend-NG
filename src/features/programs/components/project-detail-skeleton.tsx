import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for a project's detail page. */
export function ProjectDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading project" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-40 w-full rounded-card" />
      <Skeleton className="h-64 w-full rounded-card" />
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  )
}
