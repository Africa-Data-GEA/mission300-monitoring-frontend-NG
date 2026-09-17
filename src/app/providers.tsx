import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { DashboardToaster } from '@/components/ui/dashboard-toast'
import { BrandProvider } from '@/features/branding/brand-provider'
import { AUTH_SESSION_CHANGED } from '@/features/auth/auth-session'

/**
 * Creates the QueryClient with defaults suited to an M&E dashboard: indicator
 * data changes on a reporting cadence, not per-second, so we cache generously
 * and avoid refetch-on-focus storms when users tab between windows.
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}

export function AppProviders({ children }: { children: ReactNode }) {
  // Held in state so the client survives re-renders but is not shared between
  // tests or SSR requests.
  const [queryClient] = useState(createQueryClient)

  useEffect(() => {
    const clearPrivateData = () => { queryClient.clear() }
    window.addEventListener(AUTH_SESSION_CHANGED, clearPrivateData)
    return () => window.removeEventListener(AUTH_SESSION_CHANGED, clearPrivateData)
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        {children}
        <DashboardToaster />
      </BrandProvider>
    </QueryClientProvider>
  )
}
