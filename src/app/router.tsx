import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { RouteFallback } from '@/components/layout/route-fallback'

/**
 * Route table.
 *
 * Every page is code-split with React.lazy so the initial bundle carries only
 * the shell — a module the user never opens is never downloaded. As the other
 * fourteen specified pages land, add them here the same way.
 */
function lazyRoute(loader: () => Promise<Record<string, ComponentType>>, name: string) {
  const Component = lazy(async () => {
    const module = await loader()
    // Pages are named exports, so map to the default shape React.lazy expects.
    return { default: module[name]! }
  })

  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: lazyRoute(
          () => import('@/features/dashboard/dashboard-page'),
          'DashboardPage',
        ),
      },
    ],
  },
])
