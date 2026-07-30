import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { RouteFallback } from '@/components/layout/route-fallback'
import { dataSubmissionRoutes } from '@/features/data-submissions/routes'
import { stateDiscoRoutes } from '@/features/state-disco/routes'

/*
 * Pages are lazily loaded so each ships its own chunk and the initial download
 * carries only the shell.
 */
const DashboardPage = lazy(() =>
  import('@/features/dashboard/dashboard-page').then((module) => ({
    default: module.DashboardPage,
  })),
)

const AdministrationPage = lazy(() =>
  import('@/features/administration/administration-page').then((module) => ({
    default: module.AdministrationPage,
  })),
)

const StakeholdersPage = lazy(() =>
  import('@/features/stakeholders/stakeholders-page').then((module) => ({
    default: module.StakeholdersPage,
  })),
)

const KpiExplorerPage = lazy(() =>
  import('@/features/kpi-explorer/kpi-explorer-page').then((module) => ({
    default: module.KpiExplorerPage,
  })),
)

const PillarDashboardPage = lazy(() =>
  import('@/features/pillar-dashboard/pillar-dashboard-page').then((module) => ({
    default: module.PillarDashboardPage,
  })),
)

const PillarIndexPage = lazy(() =>
  import('@/features/pillar-dashboard/pillar-index-page').then((module) => ({
    default: module.PillarIndexPage,
  })),
)

const ProgramsPage = lazy(() =>
  import('@/features/programs/programs-page').then((module) => ({
    default: module.ProgramsPage,
  })),
)

const ReportsPage = lazy(() =>
  import('@/features/reports/reports-page').then((module) => ({
    default: module.ReportsPage,
  })),
)

const ProgrammeDetailPage = lazy(() =>
  import('@/features/programs/programme-detail-page').then((module) => ({
    default: module.ProgrammeDetailPage,
  })),
)

const ProjectDetailPage = lazy(() =>
  import('@/features/programs/project-detail-page').then((module) => ({
    default: module.ProjectDetailPage,
  })),
)

const LoginPage = lazy(() =>
  import('@/features/auth/login-page').then((module) => ({
    default: module.LoginPage,
  })),
)

const PasswordPage = lazy(() =>
  import('@/features/auth/password-page').then((module) => ({
    default: module.PasswordPage,
  })),
)

const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/forgot-password-page').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)

const NotFoundPage = lazy(() =>
  import('@/features/not-found/not-found-page').then((module) => ({
    default: module.NotFoundPage,
  })),
)

function lazyRoute(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

/**
 * Route table.
 *
 * `handle.globalFilters` declares whether a route uses the application-wide
 * filter bar. Most monitoring modules do; User Access and Administration does
 * not, because the specification gives it its own eight filters and narrowing
 * an account registry by Compact pillar is meaningless.
 *
 * The standalone Implementation Register and Bottlenecks & Exceptions pages
 * have been folded into Programs as drill-down levels
 * (/programs → /programs/:programmeId → /programs/projects/:projectId)
 * rather than separate top-level routes.
 */
export interface RouteHandle {
  readonly globalFilters?: boolean
}

export const router = createBrowserRouter([
  {
    path: '/account/login',
    element: lazyRoute(<LoginPage />),
  },
  {
    path: '/account/change-password',
    element: lazyRoute(<PasswordPage />),
  },
  {
    path: '/account/forgot-password',
    element: lazyRoute(<ForgotPasswordPage />),
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        path: 'dashboard',
        element: lazyRoute(<DashboardPage />),
        handle: { globalFilters: true } satisfies RouteHandle,
      },
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'kpis',
        element: lazyRoute(<KpiExplorerPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'pillars',
        element: lazyRoute(<PillarIndexPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'pillars/:pillar',
        element: lazyRoute(<PillarDashboardPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs',
        element: lazyRoute(<ProgramsPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs/:programmeId',
        element: lazyRoute(<ProgrammeDetailPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs/projects/:projectId',
        element: lazyRoute(<ProjectDetailPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'stakeholders',
        element: lazyRoute(<StakeholdersPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'administration',
        element: lazyRoute(<AdministrationPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'data-submissions',
        children: dataSubmissionRoutes,
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'reports',
        element: lazyRoute(<ReportsPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'state-disco',
        children: stateDiscoRoutes,
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: '*',
        element: lazyRoute(<NotFoundPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
    ],
  },
])
