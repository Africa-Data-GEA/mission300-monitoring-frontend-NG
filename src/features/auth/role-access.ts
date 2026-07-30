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
  ],
  'oversight-user': ['executive-overview', 'pillar-dashboards'],
  'read-only-user': ['executive-overview'],
}

export function canRoleReachModule(roleSlug: string, moduleKey: string): boolean {
  const allowed = ROLE_MODULE_KEYS[roleSlug]
  if (!allowed) return false
  return allowed === 'all' || allowed.includes(moduleKey)
}

export function getRoleLabel(roleSlug: string): string {
  return administrationOverview.roles.find((entry) => entry.role === roleSlug)?.label ?? roleSlug
}

/** Looks up the full account record for a session's user id, for fields (institution) the login response doesn't carry. */
export function findAccountById(userId: string) {
  return administrationUsers.find((entry) => entry.id === userId)
}
