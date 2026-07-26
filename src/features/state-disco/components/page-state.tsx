import type { ReactNode } from 'react'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'

export function PageState({
  pending,
  error,
  retry,
  children,
}: {
  pending: boolean
  error: Error | null
  retry: () => void
  children: ReactNode
}) {
  if (pending) return <Skeleton className="h-96 w-full rounded-card" />
  if (error) return <ErrorState title="Performance data could not be loaded" message={error.message} onRetry={retry} />
  return <>{children}</>
}
