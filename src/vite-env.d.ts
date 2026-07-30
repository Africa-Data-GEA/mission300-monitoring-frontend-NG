/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE?: 'mock' | 'hybrid' | 'backend'
  /** @deprecated Use VITE_DATA_MODE. Kept temporarily for deployed demos. */
  readonly VITE_ENABLE_MOCKS?: 'true' | 'false'
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SUBMISSIONS_BACKEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
