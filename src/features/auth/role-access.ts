import { administrationOverview, administrationUsers } from '@/mocks/data/administration'

/**
 * Which nav `moduleKey`s each role can reach, derived once from the real
 * role definitions in mocks/data/administration.ts (`roles[].modules`).
 * 'all' is the system-administrator sentinel; every other role lists the
 * exact nav sections its own `modules` array maps to. Update this if a
 * role's `modules` list changes or a nav item's `moduleKey` is added.
 *
 * `programme-admin` is a finer-grained key nested under `programs`: it gates
 * only "Add programme" (a portfolio-level, cross-institution record — see
 * mocks/data/programs.ts). institutional-data-provider reaches `programs`
 * for its own institution's projects, milestones and bottlenecks (the old
 * Implementation Register / Bottlenecks & Exceptions pages, per
 * administration.ts's role definition), but is institution-scoped and never
 * creates a programme itself. Same pattern as `kpi-metadata` under
 * `kpi-directory`.
 */
const ROLE_MODULE_KEYS: Record<string, readonly string[] | 'all'> = {
  'system-administrator': 'all',
  'institutional-data-provider': ['institution-overview', 'data-submissions', 'programs'],
  'data-reviewer': ['data-submissions', 'kpi-directory'],
  validator: ['data-submissions', 'kpi-directory'],
  'dashboard-manager': [
    'executive-overview',
    'pillar-dashboards',
    'state-disco',
    'programs',
    'programme-admin',
    'reform-actions',
    'reform-admin',
    'kpi-directory',
    'reports',
    'learning-log',
  ],
  'oversight-user': ['executive-overview', 'pillar-dashboards', 'reports', 'reform-actions'],
  'read-only-user': ['executive-overview'],
}

/**
 * `institution-overview` is carved out of system-administrator's `'all'`
 * sentinel: it's one Institutional Data Provider's own self-scoped view of
 * their own institution's submissions, not a general admin page, and the
 * backend already enforces exactly that (`@Roles("INSTITUTIONAL_DATA_PROVIDER")`
 * on GET /institutions/me/overview, with no admin bypass). Letting `'all'`
 * grant it here would show any other role the nav item and route only to
 * hit a 403 the moment the page tried to load its data.
 */
const ADMIN_ALL_EXCLUDES = new Set(['institution-overview'])

export function canRoleReachModule(roleSlug: string, moduleKey: string): boolean {
  const allowed = ROLE_MODULE_KEYS[roleSlug]
  if (!allowed) return false
  if (allowed === 'all') return !ADMIN_ALL_EXCLUDES.has(moduleKey)
  return allowed.includes(moduleKey)
}

export function grantedRoles(user: { role: string; roles?: readonly string[] }): readonly string[] {
  return user.roles?.length ? user.roles : [user.role]
}

export function canUserReachModule(user: { role: string; roles?: readonly string[] }, moduleKey: string): boolean {
  return grantedRoles(user).some((role) => canRoleReachModule(role, moduleKey))
}

export function landingPathForRole(roleSlug: string): string {
  const destinations = [
    ['executive-overview', '/dashboard'],
    ['institution-overview', '/overview'],
    ['data-submissions', '/data-submissions'],
    ['kpi-directory', '/kpis'],
    ['reports', '/reports'],
    ['programs', '/programs'],
  ] as const
  return destinations.find(([moduleKey]) => canRoleReachModule(roleSlug, moduleKey))?.[1]
    ?? '/access-denied'
}

export function landingPathForUser(user: { role: string; roles?: readonly string[] }): string {
  const destinations = [
    ['executive-overview', '/dashboard'],
    ['institution-overview', '/overview'],
    ['data-submissions', '/data-submissions'],
    ['kpi-directory', '/kpis'],
    ['reports', '/reports'],
    ['programs', '/programs'],
  ] as const
  return destinations.find(([key]) => canUserReachModule(user, key))?.[1] ?? '/access-denied'
}

export function getRoleLabel(roleSlug: string): string {
  return administrationOverview.roles.find((entry) => entry.role === roleSlug)?.label ?? roleSlug
}

/** Looks up the full account record for a session's user id, for fields (institution) the login response doesn't carry. */
export function findAccountById(userId: string) {
  return administrationUsers.find((entry) => entry.id === userId)
}
