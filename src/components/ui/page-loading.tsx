import { Skeleton } from './skeleton'

/** Loading state for pages that wait on a single request: a quiet placeholder,
 * with the label announced to assistive tech rather than flashed on screen. */
export function PageLoading({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex flex-col gap-4">
      <p className="sr-only" role="status">{label}…</p>
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  )
}
