import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router'
import { Navigate } from 'react-router'
import { RouteFallback } from '@/components/layout/route-fallback'
import { RequireAnyRole } from '@/features/auth/require-auth'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'

const InstitutionDashboardPage = lazy(() => import('./pages/institution-dashboard-page').then((module) => ({ default: module.InstitutionDashboardPage })))
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

function rolePage(roles: readonly string[], element: React.ReactNode) {
  return <RequireAnyRole roles={roles}>{page(element)}</RequireAnyRole>
}

const PROVIDER = ['institutional-data-provider']
const REVIEWERS = ['data-reviewer', 'validator']

function DataSubmissionsIndex() {
  const session = readAuthSession()
  const roles = session ? grantedRoles(session.user) : []
  if (roles.includes('institutional-data-provider')) return page(<InstitutionDashboardPage />)
  if (roles.includes('data-reviewer') || roles.includes('validator')) {
    return <Navigate to="validation" replace />
  }
  return <Navigate to="submissions" replace />
}

export const dataSubmissionRoutes: RouteObject[] = [
  { index: true, element: <DataSubmissionsIndex /> },
  { path: 'obligations', element: page(<ObligationsPage />) },
  { path: 'obligations/:obligationId/entry', element: rolePage(PROVIDER, <ManualEntryPage />) },
  { path: 'obligations/:obligationId/upload', element: rolePage(PROVIDER, <UploadPage />) },
  { path: 'submissions', element: page(<SubmissionsPage />) },
  { path: 'validation', element: rolePage(REVIEWERS, <ValidationQueuePage />) },
  { path: 'validation/:submissionId', element: rolePage(REVIEWERS, <ValidationDetailPage />) },
  { path: 'overdue', element: page(<OverduePage />) },
  { path: 'gaps', element: page(<DataGapsPage />) },
]
