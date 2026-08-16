import { http as realHttp, HttpResponse } from 'msw'

export { HttpResponse }

/**
 * Neutralised for the browser's in-process router — every handler had a
 * fixed artificial `await delay(300)`-style network wait, which was real,
 * user-visible dev-mode weight, not a requirement of the mock contract.
 * Kept as a same-signature drop-in (any arguments accepted and ignored) so
 * no handler file's call site changes; it now just resolves immediately.
 * Tests still exercise real MSW timing via `msw/node` (see server.ts),
 * untouched by this file.
 */
export function delay(...args: unknown[]): Promise<void> {
  void args
  return Promise.resolve()
}

type Resolver = (info: { request: Request; params: Record<string, string> }) => unknown

interface Route {
  method: string
  regex: RegExp
  keys: string[]
  resolver: Resolver
}

const routes: Route[] = []

function compile(path: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = []
  const source = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1))
        return '([^/]+)'
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { regex: new RegExp(`^${source}$`), keys }
}

function register(method: string, path: string, resolver: Resolver) {
  const { regex, keys } = compile(path)
  routes.push({ method, regex, keys, resolver })
}

type RealHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

/**
 * Same call shape as `msw`'s own `http.get/post/put/patch/delete` — every
 * mock handler file keeps calling `http.get('/api/x', resolver)` completely
 * unchanged, only the import switches to this module. Each call registers
 * into this file's own routing table (read by `dispatchLocalRequest`, used
 * by the real browser app) *and* still registers with real MSW underneath
 * (the returned handler), so `src/mocks/server.ts` — the Node-based server
 * the test suite runs against via `msw/node` — keeps working exactly as
 * before, completely unaffected by any of this.
 */
function wrap(method: string, realMethod: RealHttpMethod) {
  return (path: string, resolver: Resolver) => {
    register(method, path, resolver)
    return realHttp[realMethod](path, resolver as Parameters<(typeof realHttp)[RealHttpMethod]>[1])
  }
}

export const http = {
  get: wrap('GET', 'get'),
  post: wrap('POST', 'post'),
  put: wrap('PUT', 'put'),
  patch: wrap('PATCH', 'patch'),
  delete: wrap('DELETE', 'delete'),
}

/**
 * Runs a request straight through the same resolver function a mock handler
 * already defines — no network call, no service worker, just a plain
 * in-process function call against the data in src/mocks/data. This is what
 * `api-client.ts` calls in mock/hybrid mode instead of `fetch()`.
 *
 * Returns `null` when no route matches, mirroring MSW's own
 * `onUnhandledRequest` case — the caller decides how to report that.
 */
export async function dispatchLocalRequest(
  method: string,
  url: string,
  init: { body?: BodyInit | null; headers?: HeadersInit } = {},
): Promise<Response | null> {
  const parsed = new URL(url, 'http://localhost')

  for (const route of routes) {
    if (route.method !== method) continue
    const match = route.regex.exec(parsed.pathname)
    if (!match) continue

    const params: Record<string, string> = {}
    route.keys.forEach((key, index) => {
      params[key] = decodeURIComponent(match[index + 1] ?? '')
    })

    const hasBody = init.body !== undefined && init.body !== null && method !== 'GET' && method !== 'HEAD'
    const request = new Request(`http://localhost${parsed.pathname}${parsed.search}`, {
      method,
      headers: init.headers,
      ...(hasBody ? { body: init.body } : {}),
    })

    const result = await route.resolver({ request, params })
    return result instanceof Response ? result : null
  }

  return null
}
