import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router'
import { Navigate } from 'react-router'
import { RouteFallback } from '@/components/layout/route-fallback'

const ReportBuilderPage = lazy(() => import('./pages/report-builder-page').then((module) => ({ default: module.ReportBuilderPage })))
const CompactExportsPage = lazy(() => import('./pages/compact-exports-page').then((module) => ({ default: module.CompactExportsPage })))
const KpiMethodologyPage = lazy(() => import('./pages/kpi-methodology-page').then((module) => ({ default: module.KpiMethodologyPage })))
const SavedReportsPage = lazy(() => import('./pages/saved-reports-page').then((module) => ({ default: module.SavedReportsPage })))

function page(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export const reportRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="builder" replace /> },
  { path: 'builder', element: page(<ReportBuilderPage />) },
  { path: 'exports', element: page(<CompactExportsPage />) },
  { path: 'methodology', element: page(<KpiMethodologyPage />) },
  { path: 'saved', element: page(<SavedReportsPage />) },
]
