import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router'
import { Navigate } from 'react-router'
import { routeChunks } from '@/app/route-chunks'
import { RouteFallback } from '@/components/layout/route-fallback'
import { RequireAnyRole } from '@/features/auth/require-auth'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'

const InstitutionDashboardPage = lazy(() => routeChunks.dataSubmissions().then((module) => ({ default: module.InstitutionDashboardPage })))
const ObligationsPage = lazy(() => routeChunks.dataSubmissionsObligations().then((module) => ({ default: module.ObligationsPage })))
const WorkbookUploadPage = lazy(() => routeChunks.dataSubmissionsWorkbook().then((module) => ({ default: module.WorkbookUploadPage })))
const SubmissionsPage = lazy(() => routeChunks.dataSubmissionsHistory().then((module) => ({ default: module.SubmissionsPage })))
const ManualEntryPage = lazy(() => import('./pages/manual-entry-page').then((module) => ({ default: module.ManualEntryPage })))
const UploadPage = lazy(() => import('./pages/upload-page').then((module) => ({ default: module.UploadPage })))
const ValidationQueuePage = lazy(() => routeChunks.dataSubmissionsValidation().then((module) => ({ default: module.ValidationQueuePage })))
const UploadReviewPage = lazy(() => import('./pages/upload-review-page').then((module) => ({ default: module.UploadReviewPage })))
const ValidationDetailPage = lazy(() => import('./pages/validation-detail-page').then((module) => ({ default: module.ValidationDetailPage })))
const OverduePage = lazy(() => routeChunks.dataSubmissionsOverdue().then((module) => ({ default: module.OverduePage })))
const DataGapsPage = lazy(() => routeChunks.dataSubmissionsGaps().then((module) => ({ default: module.DataGapsPage })))

function page(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

function rolePage(roles: readonly string[], element: React.ReactNode) {
  return <RequireAnyRole roles={roles}>{page(element)}</RequireAnyRole>
}

const PROVIDER = ['institutional-data-provider']
// Kept in sync with the REVIEW_ROLES lists in workflow-shell.tsx,
// submissions-page.tsx and institution-dashboard-page.tsx, which decide
// whether to *show* a validation-queue/detail link. system-administrator
// has to be included here too, or an admin sees those links (correctly, per
// the "all modules" sentinel in role-access.ts) but then gets bounced to
// /access-denied by this guard when they click one.
const REVIEWERS = ['data-reviewer', 'validator', 'system-administrator']

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
  { path: 'workbook', element: rolePage([...PROVIDER, 'system-administrator'], <WorkbookUploadPage />) },
  { path: 'submissions', element: page(<SubmissionsPage />) },
  { path: 'validation', element: rolePage(REVIEWERS, <ValidationQueuePage />) },
  { path: 'validation/batches/:batchId', element: rolePage(REVIEWERS, <UploadReviewPage />) },
  { path: 'validation/:submissionId', element: rolePage(REVIEWERS, <ValidationDetailPage />) },
  { path: 'overdue', element: page(<OverduePage />) },
  { path: 'gaps', element: page(<DataGapsPage />) },
]
