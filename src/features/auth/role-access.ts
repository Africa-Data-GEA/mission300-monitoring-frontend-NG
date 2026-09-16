import { administrationOverview, administrationUsers } from '@/mocks/data/administration'

/**
 * Which nav `moduleKey`s each role can reach, derived once from the real
 * role definitions in mocks/data/administration.ts (`roles[].modules`).
 * 'all' is the system-administrator sentinel; every other role lists the
 * exact nav sections its own `modules` array maps to. Update this if a
 * role's `modules` list changes or a nav item's `moduleKey` is added.
 */
const ROLE_MODULE_KEYS: Record<string, readonly string[] | 'all'> = {
  'system-administrator': 'all',
  'institutional-data-provider': ['data-submissions', 'programs'],
  'data-reviewer': ['data-submissions', 'kpi-directory'],
  validator: ['data-submissions', 'kpi-directory'],
  'dashboard-manager': [
    'executive-overview',
    'pillar-dashboards',
    'state-disco',
    'programs',
    'kpi-directory',
    'reports',
    'learning-log',
  ],
  'oversight-user': ['executive-overview', 'pillar-dashboards', 'reports'],
  'read-only-user': ['executive-overview'],
}

export function canRoleReachModule(roleSlug: string, moduleKey: string): boolean {
  const allowed = ROLE_MODULE_KEYS[roleSlug]
  if (!allowed) return false
  return allowed === 'all' || allowed.includes(moduleKey)
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
