import { Skeleton } from '@/components/ui/skeleton'

/** Login-shaped fallback shown only while the small authentication chunk loads. */
export function AuthRouteFallback() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading sign in"
      className="flex min-h-dvh items-center justify-center bg-surface-page px-4 py-8 sm:px-8"
    >
      <section className="w-full max-w-[29rem] rounded-card bg-surface px-6 py-8 sm:px-8 sm:py-10">
        <p className="mb-4 text-center text-sm font-medium text-text-muted">Loading sign in…</p>
        <Skeleton className="mx-auto mb-10 h-12 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-3 h-5 w-full max-w-80" />
        <Skeleton className="mt-7 h-11 w-full" />
        <Skeleton className="mt-6 h-11 w-full" />
      </section>
    </main>
  )
}

/**
 * Shown while a lazily-loaded route chunk downloads.
 *
 * Deliberately shaped like a dashboard page — filter bar, title, card grid —
 * so the layout does not jump when the real page mounts.
 */
export function RouteFallback() {
  return (
    <div aria-busy="true" aria-label="Loading page" className="flex flex-col gap-4">
      <p className="text-sm font-medium text-text-muted">Loading page…</p>
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
