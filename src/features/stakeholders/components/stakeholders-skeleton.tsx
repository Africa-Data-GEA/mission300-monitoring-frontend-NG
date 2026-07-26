import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the Stakeholders & Institutions page. */
export function StakeholdersSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading stakeholders" className="space-y-4">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-24 w-full rounded-card" />
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  )
}
