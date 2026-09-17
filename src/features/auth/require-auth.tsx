import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { readAuthSession } from './auth-session'
import { canUserReachModule, grantedRoles } from './role-access'

/** Keeps authenticated application routes behind a valid, unexpired session. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()

  if (!readAuthSession()) {
    return <Navigate to="/account/login" replace state={{ from: location.pathname }} />
  }

  return children
}

/** Prevents direct URLs from bypassing role-filtered navigation. The API must also enforce roles. */
export function RequireModule({ moduleKey, children }: { moduleKey: string; children: ReactNode }) {
  const session = readAuthSession()
  if (!session) return <Navigate to="/account/login" replace />
  if (!canUserReachModule(session.user, moduleKey)) {
    return <Navigate to="/access-denied" replace />
  }
  return children
}

export function RequireAnyRole({ roles, children }: { roles: readonly string[]; children: ReactNode }) {
  const session = readAuthSession()
  if (!session) return <Navigate to="/account/login" replace />
  if (!grantedRoles(session.user).some((role) => roles.includes(role))) return <Navigate to="/access-denied" replace />
  return children
}
