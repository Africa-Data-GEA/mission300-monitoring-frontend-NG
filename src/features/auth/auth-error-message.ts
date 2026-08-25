import { ApiError, ContractError } from '@/lib/api-client'

/**
 * The message shown to someone who could not sign in.
 *
 * WHY THIS EXISTS. All three auth hooks previously did
 * `error instanceof ApiError ? error.message : 'Something went wrong.'`, which
 * collapsed every non-HTTP failure into one sentence. A ContractError — the
 * backend and this client disagreeing about a response shape — names the exact
 * offending field, and that detail was being thrown away. The symptom was a
 * user staring at "Something went wrong. Please try again." while the backend
 * was returning 200 and the real cause (`institution: Too small`) was sitting
 * unread in the discarded error.
 *
 * The fix is not to show the reader the contract error. "Response from
 * /auth/identify did not match the expected contract" is not a sentence anyone
 * signing in can act on, and on a government service it reads as a leak. So:
 * the reader gets an honest message saying the fault is ours and not theirs —
 * which matters, because the alternative has them retyping a correct email —
 * and the full detail goes to the console for whoever is debugging.
 */
export function authErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message

  if (error instanceof ContractError) {
    // The one place the detail survives. Without this the next contract drift
    // is as invisible as this one was.
    console.error(`[auth] ${error.message}`, error.issues)
    return 'The service returned a response this application could not read. This is a fault on our side, not with your details. Please try again, or contact your administrator if it continues.'
  }

  return 'Something went wrong. Please try again.'
}
