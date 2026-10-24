import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { AuthRouteFallback, RouteFallback } from '@/components/layout/route-fallback'
import { routeChunks } from '@/app/route-chunks'
import { RequireAuth, RequireModule } from '@/features/auth/require-auth'
import { dataSubmissionRoutes } from '@/features/data-submissions/routes'
import { stateDiscoRoutes } from '@/features/state-disco/routes'

/*
 * Pages are lazily loaded so each ships its own chunk and the initial download
 * carries only the shell.
 */
const DashboardPage = lazy(() =>
  routeChunks.dashboard().then((module) => ({
    default: module.DashboardPage,
  })),
)

const InstitutionOverviewPage = lazy(() =>
  routeChunks.institutionOverview().then((module) => ({
    default: module.InstitutionOverviewPage,
  })),
)

const PublicGatewayPage = lazy(() =>
  routeChunks.publicGateway().then((module) => ({
    default: module.PublicGatewayPage,
  })),
)

const ProgressPage = lazy(() =>
  routeChunks.progress().then((module) => ({
    default: module.ProgressPage,
  })),
)

const AdministrationPage = lazy(() =>
  routeChunks.administration().then((module) => ({
    default: module.AdministrationPage,
  })),
)

const StakeholdersPage = lazy(() =>
  routeChunks.stakeholders().then((module) => ({
    default: module.StakeholdersPage,
  })),
)

const KpiExplorerPage = lazy(() =>
  routeChunks.kpiExplorer().then((module) => ({
    default: module.KpiExplorerPage,
  })),
)

const PillarDashboardPage = lazy(() =>
  routeChunks.pillarDashboard().then((module) => ({
    default: module.PillarDashboardPage,
  })),
)

const PillarIndexPage = lazy(() =>
  routeChunks.pillarIndex().then((module) => ({
    default: module.PillarIndexPage,
  })),
)

const ProgramsPage = lazy(() =>
  routeChunks.programs().then((module) => ({
    default: module.ProgramsPage,
  })),
)

const BottlenecksPage = lazy(() =>
  routeChunks.bottlenecks().then((module) => ({
    default: module.BottlenecksPage,
  })),
)

const ReportsPage = lazy(() =>
  routeChunks.reports().then((module) => ({
    default: module.ReportsPage,
  })),
)

const LearningLogPage = lazy(() =>
  routeChunks.learningLog().then((module) => ({
    default: module.LearningLogPage,
  })),
)

const ReformActionsPage = lazy(() =>
  routeChunks.reformActions().then((module) => ({
    default: module.ReformActionsPage,
  })),
)

const ProgrammeDetailPage = lazy(() =>
  routeChunks.programmeDetail().then((module) => ({
    default: module.ProgrammeDetailPage,
  })),
)

const ProjectDetailPage = lazy(() =>
  routeChunks.projectDetail().then((module) => ({
    default: module.ProjectDetailPage,
  })),
)

const AddProjectPage = lazy(() =>
  routeChunks.addProject().then((module) => ({
    default: module.AddProjectPage,
  })),
)

const EditProjectPage = lazy(() =>
  routeChunks.editProject().then((module) => ({
    default: module.EditProjectPage,
  })),
)

const AddProgrammePage = lazy(() =>
  routeChunks.addProgramme().then((module) => ({
    default: module.AddProgrammePage,
  })),
)

const BulkUploadProjectsPage = lazy(() =>
  routeChunks.bulkUploadProjects().then((module) => ({
    default: module.BulkUploadProjectsPage,
  })),
)

const LoginPage = lazy(() =>
  routeChunks.login().then((module) => ({
    default: module.LoginPage,
  })),
)

const PasswordPage = lazy(() =>
  routeChunks.password().then((module) => ({
    default: module.PasswordPage,
  })),
)

const ForgotPasswordPage = lazy(() =>
  routeChunks.forgotPassword().then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)

const SetPasswordPage = lazy(() =>
  routeChunks.setPassword().then((module) => ({ default: module.SetPasswordPage })),
)

const NotFoundPage = lazy(() =>
  routeChunks.notFound().then((module) => ({
    default: module.NotFoundPage,
  })),
)

function lazyRoute(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

function moduleRoute(moduleKey: string, element: React.ReactNode) {
  return <RequireModule moduleKey={moduleKey}>{lazyRoute(element)}</RequireModule>
}

function authRoute(element: React.ReactNode) {
  return <Suspense fallback={<AuthRouteFallback />}>{element}</Suspense>
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
    element: authRoute(<LoginPage />),
  },
  /*
   * The second sign-in step — the user enters their existing password. It was
   * previously routed at /account/change-password, which read as a reset flow;
   * that old path now redirects here so any saved link still lands correctly.
   */
  {
    path: '/account/password',
    element: authRoute(<PasswordPage />),
  },
  {
    path: '/account/change-password',
    element: <Navigate to="/account/password" replace />,
  },
  {
    path: '/account/forgot-password',
    element: authRoute(<ForgotPasswordPage />),
  },
  {
    path: '/account/reset-password',
    element: authRoute(<SetPasswordPage />),
  },
  {
    path: '/account/set-password',
    element: authRoute(<SetPasswordPage />),
  },
  /*
   * `/` is the public gateway, not a redirect into the dashboard.
   *
   * It sits OUTSIDE AppShell — the landing page has no sidebar, no global
   * filter bar and no authenticated chrome. The authenticated modules keep
   * their relative paths by nesting under a pathless layout route, so
   * /dashboard, /kpis and the rest are untouched.
   */
  {
    path: '/',
    children: [
      {
        index: true,
        element: lazyRoute(<PublicGatewayPage />),
      },
      {
        // Public, outside AppShell — no sidebar, no authenticated chrome.
        path: 'progress',
        element: lazyRoute(<ProgressPage />),
      },
      {
        element: (
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        ),
        children: [
      {
        path: 'dashboard',
        element: moduleRoute('executive-overview', <DashboardPage />),
        handle: { globalFilters: true } satisfies RouteHandle,
      },
      {
        path: 'overview',
        element: moduleRoute('institution-overview', <InstitutionOverviewPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'kpis',
        element: moduleRoute('kpi-directory', <KpiExplorerPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'pillars',
        element: moduleRoute('pillar-dashboards', <PillarIndexPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'pillars/:pillar',
        element: moduleRoute('pillar-dashboards', <PillarDashboardPage />),
        handle: { globalFilters: true } satisfies RouteHandle,
      },
      {
        path: 'programs',
        element: moduleRoute('programs', <ProgramsPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      /*
       * The bottleneck register. Programs remains the drill-down home for a
       * single project's bottlenecks, but the register also needs its own
       * address: Executive Overview already linked here, and review asked for
       * bottleneck cross-links from the Programs tables
       * (docs/M300 Monitoring Platform Feedback.pptx, slide 12).
       */
      {
        path: 'bottlenecks',
        element: moduleRoute('programs', <BottlenecksPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs/new',
        element: moduleRoute('programme-admin', <AddProgrammePage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs/:programmeId',
        element: moduleRoute('programs', <ProgrammeDetailPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs/projects/new',
        element: moduleRoute('programs', <AddProjectPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs/bulk-upload',
        element: moduleRoute('programs', <BulkUploadProjectsPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs/projects/:projectId',
        element: moduleRoute('programs', <ProjectDetailPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'programs/projects/:projectId/edit',
        element: moduleRoute('programs', <EditProjectPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'stakeholders',
        element: moduleRoute('stakeholders', <StakeholdersPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'administration',
        element: moduleRoute('administration', <AdministrationPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'data-submissions',
        element: <RequireModule moduleKey="data-submissions"><Outlet /></RequireModule>,
        children: dataSubmissionRoutes,
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'reports',
        element: moduleRoute('reports', <ReportsPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'reform-actions',
        element: moduleRoute('reform-actions', <ReformActionsPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'learning-log',
        element: moduleRoute('learning-log', <LearningLogPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'state-disco',
        element: <RequireModule moduleKey="state-disco"><Outlet /></RequireModule>,
        children: stateDiscoRoutes,
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: 'access-denied',
        element: <main role="alert" className="rounded-card bg-surface p-8"><h1 className="text-2xl font-semibold">Access denied</h1><p className="mt-2">Your role does not permit this page.</p></main>,
        handle: { globalFilters: false } satisfies RouteHandle,
      },
      {
        path: '*',
        element: lazyRoute(<NotFoundPage />),
        handle: { globalFilters: false } satisfies RouteHandle,
      },
        ],
      },
    ],
  },
])
