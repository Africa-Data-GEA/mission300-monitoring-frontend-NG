import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/** Service-worker-based mocking, used in development only. */
export const worker = setupWorker(...handlers)
