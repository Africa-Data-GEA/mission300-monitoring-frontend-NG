/**
 * The dynamic imports behind every lazily-loaded route, in one place.
 *
 * `router.tsx` feeds these to `lazy()`; `prefetchRouteChunks` below warms the
 * same chunks once the app is idle. Both must call the *same* thunk so the
 * bundler resolves them to one chunk — prefetching a duplicated specifier
 * would download a second copy and warm nothing.
 *
 * Why prefetch at all: a route's chunk is only fetched when it is first
 * visited, so the first click on a nav item shows the full-page
 * `RouteFallback` skeleton while it downloads. Measured cold, that was ~2.4s
 * on Reports (a 1.4 MB chunk) and ~2.0s on State & DisCo. Warming them in
 * the background removes that wait: by the time anyone clicks, the module is
 * already in memory.
 */

export const routeChunks = {
  dashboard: () => import('@/features/dashboard/dashboard-page'),
  institutionOverview: () => import('@/features/institution-overview/institution-overview-page'),
  kpiExplorer: () => import('@/features/kpi-explorer/kpi-explorer-page'),
  pillarDashboard: () => import('@/features/pillar-dashboard/pillar-dashboard-page'),
  pillarIndex: () => import('@/features/pillar-dashboard/pillar-index-page'),
  programs: () => import('@/features/programs/programs-page'),
  bottlenecks: () => import('@/features/bottlenecks/bottlenecks-page'),
  learningLog: () => import('@/features/learning-log/learning-log-page'),
  stakeholders: () => import('@/features/stakeholders/stakeholders-page'),
  administration: () => import('@/features/administration/administration-page'),
  reports: () => import('@/features/reports/reports-page'),
  progress: () => import('@/features/public-gateway/progress-page'),
  publicGateway: () => import('@/features/public-gateway/public-gateway-page'),
  programmeDetail: () => import('@/features/programs/programme-detail-page'),
  projectDetail: () => import('@/features/programs/project-detail-page'),
  addProject: () => import('@/features/programs/pages/add-project-page'),
  editProject: () => import('@/features/programs/pages/edit-project-page'),
  addProgramme: () => import('@/features/programs/pages/add-programme-page'),
  bulkUploadProjects: () => import('@/features/programs/pages/bulk-upload-projects-page'),
  // Landing pages of the two nested route groups (state-disco/routes.tsx and
  // data-submissions/routes.tsx declare their own lazy pages).
  stateDisco: () => import('@/features/state-disco/pages/state-disco-page'),
  dataSubmissions: () => import('@/features/data-submissions/pages/institution-dashboard-page'),
  login: () => import('@/features/auth/login-page'),
  password: () => import('@/features/auth/password-page'),
  forgotPassword: () => import('@/features/auth/forgot-password-page'),
  setPassword: () => import('@/features/auth/set-password-page'),
  notFound: () => import('@/features/not-found/not-found-page'),
} as const

/**
 * Sidebar destinations, cheapest first. Reports is last on purpose: its
 * chunk is by far the largest, so warming it ahead of the others would hold
 * the network open while a lighter page the user is more likely to open next
 * waits behind it.
 */
const PREFETCH_ORDER: (keyof typeof routeChunks)[] = [
  'institutionOverview',
  'kpiExplorer',
  'programs',
  'pillarDashboard',
  'pillarIndex',
  'bottlenecks',
  'learningLog',
  'stateDisco',
  'dataSubmissions',
  'stakeholders',
  'administration',
  'reports',
]

/**
 * Heavy shared vendor chunks that several pages suspend on.
 *
 * The charting library is its own ~800 kB chunk, so whichever chart-bearing
 * page is opened first still flashed the loading skeleton even once its own
 * route chunk was warm. Warming the library once covers all of them.
 */
const VENDOR_PREFETCH = [() => import('react-apexcharts')]

let started = false

/**
 * Warms route chunks one at a time while the browser is idle.
 *
 * Sequential rather than parallel so the prefetch never competes with the
 * current page's own data requests for connections, and guarded so repeated
 * mounts (StrictMode's double-invoke included) only ever schedule one pass.
 */
export function prefetchRouteChunks(): void {
  if (started || typeof window === 'undefined') return
  started = true

  const idle = window.requestIdleCallback
  const schedule = (fn: () => void) => {
    if (typeof idle === 'function') idle.call(window, fn, { timeout: 4000 })
    else window.setTimeout(fn, 300)
  }

  const queue: (() => Promise<unknown>)[] = [
    ...VENDOR_PREFETCH,
    ...PREFETCH_ORDER.map((key) => routeChunks[key]),
  ]

  let index = 0
  const next = () => {
    const load = queue[index++]
    if (!load) return
    // A failed prefetch is not worth surfacing: the route still loads
    // normally on click, which is exactly the pre-prefetch behaviour.
    void load()
      .catch(() => undefined)
      .then(() => schedule(next))
  }

  schedule(next)
}
