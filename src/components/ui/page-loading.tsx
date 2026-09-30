import { Skeleton } from './skeleton'

/** Visible loading state for pages that wait on a single request. */
export function PageLoading({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex flex-col gap-4">
      <p className="text-sm font-medium text-text-muted" role="status">{label}…</p>
      <Skeleton className="h-96 w-full rounded-card" />
    </div>
  )
}
