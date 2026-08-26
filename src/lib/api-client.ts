import type { z } from 'zod'
import { environment } from '@/config/environment'
import { clearAuthSession, readAuthSession } from '@/features/auth/auth-session'
import { dispatchLocalRequest } from '@/mocks/local-router'

/**
 * Thin typed wrapper over fetch.
 *
 * Every network call in the app goes through here so that auth headers, error
 * shape, base URL and response validation are defined in exactly one place.
 *
 * Mock and hybrid modes never touch the network or a service worker: `request`
 * dispatches straight into the same handler functions mocks/handlers/*.ts
 * already define, in-process (see mocks/local-router.ts) — same handler code,
 * same data in mocks/data/*.ts, just called directly instead of intercepted.
 * `backend` mode is untouched: a real `fetch()` to `environment.apiBaseUrl`,
 * exactly as before.
 */

const BASE_URL = environment.usesBrowserMocks
  ? '/api'
  : environment.apiBaseUrl

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

async function authenticatedDownload(path: string): Promise<Blob> {
  // API-provided links include `/api`, while BASE_URL already points there.
  // Static mock assets remain ordinary same-origin downloads.
  const isApiDownload = path.startsWith('/api/')
  const requestPath = isApiDownload ? path.slice('/api'.length) : path
  const accessToken = isApiDownload ? readAuthSession()?.accessToken : null
  const response = isApiDownload
    ? environment.usesLocalRouter
      ? await dispatchLocalRequest('GET', `${BASE_URL}${requestPath}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        })
      : await fetch(`${BASE_URL}${requestPath}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        })
    : await fetch(requestPath)

  if (!response) {
    throw new ContractError(path, [{ path: '(response)', message: `no handler matched GET ${path}` }])
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    const payload: unknown = contentType.includes('json')
      ? await response.json().catch(() => undefined)
      : await response.text().catch(() => undefined)

    if (response.status === 401 && isApiDownload) clearAuthSession()
    throw new ApiError(
      response.status,
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : response.statusText,
      payload,
    )
  }

  return response.blob()
}

async function request<T>(
  path: string,
  schema: z.ZodType<T> | undefined,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, method = 'GET', ...rest } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const accessToken = path.startsWith('/auth/') ? null : readAuthSession()?.accessToken
  const resolvedHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...headers,
  }
  const resolvedBody = body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body)

  const response = environment.usesLocalRouter
    ? await dispatchLocalRequest(String(method), `${BASE_URL}${path}`, {
        body: resolvedBody,
        headers: resolvedHeaders,
      })
    : await fetch(`${BASE_URL}${path}`, {
        ...rest,
        method,
        headers: resolvedHeaders,
        ...(resolvedBody === undefined ? {} : { body: resolvedBody }),
      })

  if (!response) {
    throw new ContractError(path, [
      {
        path: '(response)',
        message: `no mock handler matched ${String(method)} ${path} — check mocks/handlers for a matching route.`,
      },
    ])
  }

  if (!response.ok) {
    // Try to surface the server's error payload; fall back to the status text.
    const payload = await response.json().catch(() => undefined)
    if (response.status === 401 && !path.startsWith('/auth/')) {
      clearAuthSession()
    }

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
   * A 2xx that is not JSON almost always means the request was never handled
   * by a real backend: in `backend` mode this is the dev server (or a
   * misconfigured VITE_API_BASE_URL) answering with the SPA shell instead of
   * the API. Saying so beats "Unexpected token '<'". Mock/hybrid mode can't
   * hit this branch at all — dispatchLocalRequest either returns a real
   * `HttpResponse.json(...)` or `null`, handled above.
   */
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('json')) {
    throw new ContractError(path, [
      {
        path: '(response)',
        message:
          `expected JSON but received "${contentType || 'no content-type'}". ` +
          'Check VITE_API_BASE_URL — the request may be hitting the dev server instead of a real API.',
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
  download: authenticatedDownload,
}
