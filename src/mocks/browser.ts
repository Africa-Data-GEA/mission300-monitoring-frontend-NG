import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/** Service-worker API layer used in development and explicit hybrid demos. */
export const worker = setupWorker(...handlers)
