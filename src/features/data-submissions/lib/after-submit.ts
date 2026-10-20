import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'

export const SUBMISSION_HISTORY_PATH = '/data-submissions/submissions'

const REVIEW_ROLES = ['data-reviewer', 'validator', 'system-administrator']

/** Where to go after a successful submit. A provider can never open the
 * validation pages, so if the server names one (an older backend still does)
 * they are sent to their submission history instead of an access-denied page. */
export function destinationAfterSubmit(nextUrl: string): string {
  const session = readAuthSession()
  const roles = session ? grantedRoles(session.user) : []
  const canReview = roles.some((role) => REVIEW_ROLES.includes(role))
  if (!canReview && nextUrl.startsWith('/data-submissions/validation')) return SUBMISSION_HISTORY_PATH
  return nextUrl
}
