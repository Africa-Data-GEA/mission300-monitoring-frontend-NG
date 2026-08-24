import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { readAuthSession } from './auth-session'

/** Keeps authenticated application routes behind a valid, unexpired session. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()

  if (!readAuthSession()) {
    return <Navigate to="/account/login" replace state={{ from: location.pathname }} />
  }

  return children
}
