import type { z } from 'zod'

/**
 * Thin typed wrapper over fetch.
 *
 * Every network call in the app goes through here so that auth headers, error
 * shape, base URL and response validation are defined in exactly one place.
 * Hybrid demo mode keeps requests on same-origin `/api` so MSW can decide per
 * route whether to return mock data or proxy to the submissions backend.
 */

const USE_HYBRID_MOCK_API = import.meta.env.VITE_ENABLE_MOCKS === 'true'
const BASE_URL = USE_HYBRID_MOCK_API
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL ?? '/api')

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

/**
 * Thrown when a 2xx response does not match its schema.
 *
 * Kept separate from ApiError because the causes and the fixes differ: an
 * ApiError is the backend reporting a problem, a ContractError is the backend
 * and this client disagreeing about the shape. The message names the offending
 * fields so the mismatch is actionable rather than surfacing as `undefined`
 * somewhere deep in a component.
 */
export class ContractError extends Error {
  readonly path: string
  readonly issues: readonly { path: string; message: string }[]

  constructor(path: string, issues: readonly { path: string; message: string }[]) {
    const summary = issues
      .slice(0, 5)
      .map((issue) => `${issue.path || '(root)'}: ${issue.message}`)
      .join('; ')

    super(
      `Response from ${path} did not match the expected contract — ${summary}` +
        (issues.length > 5 ? ` (+${issues.length - 5} more)` : ''),
    )
    this.name = 'ContractError'
    this.path = path
    this.issues = issues
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function request<T>(
  path: string,
  schema: z.ZodType<T> | undefined,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined
      ? {}
      : { body: isFormData ? body : JSON.stringify(body) }),
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

  /*
   * A 2xx that is not JSON almost always means the request was never handled:
   * in development the mock worker was not running and the dev server answered
   * with the SPA shell. Saying so beats "Unexpected token '<'".
   */
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('json')) {
    throw new ContractError(path, [
      {
        path: '(response)',
        message:
          `expected JSON but received "${contentType || 'no content-type'}". ` +
          'In development this usually means the mock service worker is not ' +
          'running — hard-reload the page to re-register it.',
      },
    ])
  }

  const payload: unknown = await response.json()

  // Callers may opt out of validation by passing no schema.
  if (!schema) return payload as T

  const result = schema.safeParse(payload)

  if (!result.success) {
    throw new ContractError(
      path,
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  return result.data
}

/**
 * Each verb takes an optional schema. Passing one validates the response and
 * narrows the return type from the schema, so the call site needs no generic.
 */
export const api = {
  get: <T>(path: string, schema?: z.ZodType<T>, options?: RequestOptions) =>
    request<T>(path, schema, { ...options, method: 'GET' }),
  post: <T>(
    path: string,
    body?: unknown,
    schema?: z.ZodType<T>,
    options?: RequestOptions,
  ) => request<T>(path, schema, { ...options, method: 'POST', body }),
  put: <T>(
    path: string,
    body?: unknown,
    schema?: z.ZodType<T>,
    options?: RequestOptions,
  ) => request<T>(path, schema, { ...options, method: 'PUT', body }),
  patch: <T>(
    path: string,
    body?: unknown,
    schema?: z.ZodType<T>,
    options?: RequestOptions,
  ) => request<T>(path, schema, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, schema?: z.ZodType<T>, options?: RequestOptions) =>
    request<T>(path, schema, { ...options, method: 'DELETE' }),
}
