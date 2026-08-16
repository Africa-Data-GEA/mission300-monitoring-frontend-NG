import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router'
import { RouteFallback } from '@/components/layout/route-fallback'

const StateDiscoPage = lazy(() => import('./pages/state-disco-page').then((m) => ({ default: m.StateDiscoPage })))
const StateDetailPage = lazy(() => import('./pages/state-detail-page').then((m) => ({ default: m.StateDetailPage })))

function page(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

/**
 * One consolidated page for every State & DisCo metric (see
 * state-disco-page.tsx) — no more separate tabs/routes for Overview,
 * Comparison, Supply & tariff, and Delivery. A single state's own detail
 * profile stays a genuine drill-down route, not a tab.
 */
export const stateDiscoRoutes: RouteObject[] = [
  { index: true, element: page(<StateDiscoPage />) },
  { path: 'states/:stateId', element: page(<StateDetailPage />) },
]
