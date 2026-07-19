/**
 * Thin typed wrapper over fetch.
 *
 * Every network call in the app goes through here so that auth headers, error
 * shape and base URL are defined in exactly one place. When gApp's backend is
 * ready, only VITE_API_BASE_URL changes — no call sites move.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Error thrown for any non-2xx response, carrying the status for callers. */
export class ApiError extends Error {
  // Declared as fields rather than constructor parameter properties because
  // the project enables `erasableSyntaxOnly`.
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  if (!response.ok) {
    // Try to surface the server's error payload; fall back to the status text.
    const payload = await response.json().catch(() => undefined)
    throw new ApiError(
      response.status,
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : response.statusText,
      payload,
    )
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
