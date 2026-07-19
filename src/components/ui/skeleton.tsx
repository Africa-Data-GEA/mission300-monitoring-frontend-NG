import { cn } from '@/lib/utils'

/** Loading placeholder. Hidden from assistive tech — the surrounding region
 * announces the loading state instead. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-control bg-surface-sunken', className)}
    />
  )
}
