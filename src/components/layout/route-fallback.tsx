import { useEffect, useState } from 'react'
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
 * How long a route may suspend before this fallback becomes visible.
 *
 * Route chunks are prefetched on idle (see app/route-chunks.ts), so by the
 * time anyone clicks, most navigations suspend only for as long as React
 * takes to render the page — measured at roughly 400-600ms for the
 * chart-heavy pages and near zero elsewhere. Painting a full screen of grey
 * blocks for that long reads as the app being slow, when in fact the page is
 * already on its way. Staying blank briefly lets short transitions pass
 * unnoticed; anything genuinely slow still gets its skeleton.
 */
const FALLBACK_DELAY_MS = 400

/**
 * Shown while a lazily-loaded route chunk downloads.
 *
 * Deliberately shaped like a dashboard page — filter bar, title, card grid —
 * so the layout does not jump when the real page mounts.
 */
export function RouteFallback() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), FALLBACK_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  /*
   * `aria-busy` is announced from the first render even while nothing is
   * painted, so assistive technology is told the region is loading rather
   * than being handed a silent empty page for the delay.
   */
  return (
    <div aria-busy="true" aria-label="Loading page" className="flex flex-col gap-4">
      {visible && (
        <>
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-9 w-64" />
          <div className="grid gap-4 xl:grid-cols-4">
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton key={index} className="h-44 rounded-card" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-card" />
        </>
      )}
    </div>
  )
}
