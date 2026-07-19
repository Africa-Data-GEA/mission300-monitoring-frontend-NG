import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Node-based mocking, used by Vitest via src/test/setup.ts. */
export const server = setupServer(...handlers)
