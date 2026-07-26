import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router'
import { RouteFallback } from '@/components/layout/route-fallback'

const OverviewPage = lazy(() => import('./pages/overview-page').then((m) => ({ default: m.StateDiscoOverviewPage })))
const ComparisonPage = lazy(() => import('./pages/comparison-page').then((m) => ({ default: m.DiscoComparisonPage })))
const SupplyTariffPage = lazy(() => import('./pages/supply-tariff-page').then((m) => ({ default: m.SupplyTariffPage })))
const DeliveryPage = lazy(() => import('./pages/delivery-page').then((m) => ({ default: m.DeliveryPage })))
const StatesPage = lazy(() => import('./pages/states-page').then((m) => ({ default: m.StatesPage })))
const StateDetailPage = lazy(() => import('./pages/state-detail-page').then((m) => ({ default: m.StateDetailPage })))

function page(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export const stateDiscoRoutes: RouteObject[] = [
  { index: true, element: page(<OverviewPage />) },
  { path: 'comparison', element: page(<ComparisonPage />) },
  { path: 'supply-tariff', element: page(<SupplyTariffPage />) },
  { path: 'delivery', element: page(<DeliveryPage />) },
  { path: 'states', element: page(<StatesPage />) },
  { path: 'states/:stateId', element: page(<StateDetailPage />) },
]
