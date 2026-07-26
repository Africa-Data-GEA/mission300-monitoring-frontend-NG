import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for the Bottlenecks & Exceptions page. */
export function BottlenecksSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading bottlenecks and exceptions"
      className="flex flex-col gap-4"
    >
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-16 w-full rounded-card" />
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
