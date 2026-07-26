import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
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
        index: true,
        element: lazyRoute(<DashboardPage />),
        handle: { globalFilters: true } satisfies RouteHandle,
      },
      {
        path: 'kpis',
        element: lazyRoute(<KpiExplorerPage />),
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
        path: 'state-disco',
        children: stateDiscoRoutes,
        handle: { globalFilters: false } satisfies RouteHandle,
      },
    ],
  },
])
