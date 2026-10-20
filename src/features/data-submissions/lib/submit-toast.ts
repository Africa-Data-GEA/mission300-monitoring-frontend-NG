import { dashboardToast } from '@/lib/dashboard-toast'

/** How long a refusal stays up. It can list many rows and has to be readable
 * before it disappears; the card also has a dismiss button. */
const ERROR_TOAST_MS = 30_000
const SUCCESS_TOAST_MS = 12_000
const LINE_BREAK = /\r?\n/

export function toastSubmitted(message: string) {
  dashboardToast.success('Submission received', { description: message, duration: SUCCESS_TOAST_MS })
}

export function toastRefused(error: unknown, hasRowDetails = false) {
  const full = error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.'
  const firstLine = full.split(LINE_BREAK)[0]
  const description = hasRowDetails ? `${firstLine} The values are listed beside the template.` : full
  dashboardToast.error('Submission not accepted', { description, duration: ERROR_TOAST_MS })
}
