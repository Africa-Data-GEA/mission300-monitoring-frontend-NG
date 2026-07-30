import { z } from 'zod'

const environmentSchema = z.object({
  VITE_DATA_MODE: z.enum(['mock', 'hybrid', 'backend']).optional(),
  VITE_ENABLE_MOCKS: z.enum(['true', 'false']).optional(),
  VITE_API_BASE_URL: z.string().trim().min(1).optional(),
  VITE_SUBMISSIONS_BACKEND_URL: z.string().trim().url().optional(),
})

const parsed = environmentSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  throw new Error(`Invalid frontend environment configuration: ${details}`)
}

const configuredMode = parsed.data.VITE_DATA_MODE
const legacyMode = parsed.data.VITE_ENABLE_MOCKS === 'true'
  ? parsed.data.VITE_SUBMISSIONS_BACKEND_URL ? 'hybrid' : 'mock'
  : parsed.data.VITE_ENABLE_MOCKS === 'false' ? 'backend' : undefined
const dataMode = import.meta.env.MODE === 'test'
  ? 'mock'
  : configuredMode ?? legacyMode
    ?? (import.meta.env.DEV
      ? parsed.data.VITE_SUBMISSIONS_BACKEND_URL ? 'hybrid' : 'mock'
      : 'backend')

if (dataMode === 'hybrid' && !parsed.data.VITE_SUBMISSIONS_BACKEND_URL) {
  throw new Error(
    'VITE_SUBMISSIONS_BACKEND_URL is required when VITE_DATA_MODE=hybrid.',
  )
}

export const environment = Object.freeze({
  dataMode,
  apiBaseUrl: parsed.data.VITE_API_BASE_URL ?? '/api',
  submissionsBackendUrl: parsed.data.VITE_SUBMISSIONS_BACKEND_URL,
  hybridBackendUrl:
    dataMode === 'hybrid' ? parsed.data.VITE_SUBMISSIONS_BACKEND_URL : undefined,
  usesBrowserMocks: dataMode === 'mock' || dataMode === 'hybrid',
})
