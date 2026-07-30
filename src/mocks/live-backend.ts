/**
 * Optional passthrough to the real m300-demo-backend NestJS API, for the one
 * dataset (Metering Rate) it actually implements end-to-end. Off by default —
 * every other module keeps using the in-memory mock exactly as before. Set
 * VITE_SUBMISSIONS_BACKEND_URL (e.g. http://localhost:4000) to turn it on.
 */
export function getLiveBackendUrl(): string | null {
  const url = environment.hybridBackendUrl
  return url ? url.replace(/\/$/, '') : null
}

/**
 * Forwards an intercepted request to the real backend and relays its
 * response verbatim — the mock performs no calculation or synchronization
 * of its own for whichever paths call this.
 */
export async function proxyToLiveBackend(request: Request, backendUrl: string): Promise<Response> {
  const url = new URL(request.url)
  const target = `${backendUrl}${url.pathname}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const body = hasBody ? await request.clone().arrayBuffer() : undefined

  const response = await fetch(target, { method: request.method, headers, body })
  const responseBody = await response.arrayBuffer()

  return new Response(responseBody, { status: response.status, headers: response.headers })
}
import { environment } from '@/config/environment'
