import { lazy, Suspense } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import { RouteFallback } from '@/components/layout/route-fallback'

const ObligationsPage = lazy(() => import('./pages/obligations-page').then((module) => ({ default: module.ObligationsPage })))
const SubmissionsPage = lazy(() => import('./pages/submissions-page').then((module) => ({ default: module.SubmissionsPage })))
const ManualEntryPage = lazy(() => import('./pages/manual-entry-page').then((module) => ({ default: module.ManualEntryPage })))
const UploadPage = lazy(() => import('./pages/upload-page').then((module) => ({ default: module.UploadPage })))
const ValidationQueuePage = lazy(() => import('./pages/validation-queue-page').then((module) => ({ default: module.ValidationQueuePage })))
const ValidationDetailPage = lazy(() => import('./pages/validation-detail-page').then((module) => ({ default: module.ValidationDetailPage })))
const OverduePage = lazy(() => import('./pages/overdue-page').then((module) => ({ default: module.OverduePage })))
const DataGapsPage = lazy(() => import('./pages/data-gaps-page').then((module) => ({ default: module.DataGapsPage })))

function page(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export const dataSubmissionRoutes: RouteObject[] = [
  { index: true, element: <Navigate replace to="obligations" /> },
  { path: 'obligations', element: page(<ObligationsPage />) },
  { path: 'obligations/:obligationId/entry', element: page(<ManualEntryPage />) },
  { path: 'obligations/:obligationId/upload', element: page(<UploadPage />) },
  { path: 'submissions', element: page(<SubmissionsPage />) },
  { path: 'validation', element: page(<ValidationQueuePage />) },
  { path: 'validation/:submissionId', element: page(<ValidationDetailPage />) },
  { path: 'overdue', element: page(<OverduePage />) },
  { path: 'gaps', element: page(<DataGapsPage />) },
]
