import type { ReactNode } from 'react'
import { ErrorState } from '@/components/ui/error-state'
import { PageLoading } from '@/components/ui/page-loading'

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
  if (pending) return <PageLoading label="Loading performance data" />
  if (error) return <ErrorState title="Performance data could not be loaded" message={error.message} onRetry={retry} />
  return <>{children}</>
}
