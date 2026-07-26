import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the Implementation Register page. */
export function ImplementationRegisterSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading implementation register" className="flex flex-col gap-4">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-16 w-full rounded-card" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-card" />
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  )
}
