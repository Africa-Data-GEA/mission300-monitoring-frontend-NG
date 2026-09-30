import type { ReactNode } from 'react'
import { ErrorState } from '@/components/ui/error-state'
import { PageLoading } from '@/components/ui/page-loading'

/**
 * Loading/error traffic-cop shared by the data-submissions list pages.
 *
 * Renders the shared ErrorState for a failed fetch, so every "this list could
 * not be loaded" card looks the same across the app.
 */
export function ListState({
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
  if (pending) return <PageLoading label="Loading workflow" />

  if (error) {
    return (
      <ErrorState
        title="This workflow could not be loaded"
        message={error.message}
        onRetry={retry}
      />
    )
  }

  return <>{children}</>
}
