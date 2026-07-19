import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shown while a lazily-loaded route chunk downloads.
 *
 * Deliberately shaped like a dashboard page — filter bar, title, card grid —
 * so the layout does not jump when the real page mounts.
 */
export function RouteFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading page"
      className="flex flex-col gap-4"
    >
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-card" />
    </div>
  )
}
