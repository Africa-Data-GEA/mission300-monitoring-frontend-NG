import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the User Access and Administration page. */
export function AdministrationSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading user access and administration"
      className="flex flex-col gap-4"
    >
      <Skeleton className="h-9 w-80" />
      <Skeleton className="h-20 w-full rounded-card" />
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  )
}
