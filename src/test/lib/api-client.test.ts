import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { ApiError, api } from '@/lib/api-client'

/*
 * These tests register runtime handlers on the shared MSW server. The global
 * setup resets handlers between tests, so registrations do not leak.
 */
describe('api client', () => {
  describe('request building', () => {
    it('prefixes paths with the API base URL', async () => {
      server.use(
        http.get('/api/widgets', () => HttpResponse.json({ ok: true })),
      )

      await expect(api.get('/widgets')).resolves.toEqual({ ok: true })
    })

    it('sends a JSON content-type header', async () => {
      let contentType: string | null = null
      server.use(
        http.post('/api/widgets', ({ request }) => {
          contentType = request.headers.get('content-type')
          return HttpResponse.json({}, { status: 200 })
        }),
      )

      await api.post('/widgets', { name: 'a' })

      expect(contentType).toBe('application/json')
    })

    it('serialises the request body as JSON', async () => {
      let received: unknown
      server.use(
        http.post('/api/widgets', async ({ request }) => {
          received = await request.json()
          return HttpResponse.json({})
        }),
      )

      await api.post('/widgets', { name: 'Lagos', count: 3 })

      expect(received).toEqual({ name: 'Lagos', count: 3 })
    })

    it('omits the body entirely when none is given', async () => {
      let hasBody = true
      server.use(
        http.post('/api/widgets', ({ request }) => {
          hasBody = request.body !== null
          return HttpResponse.json({})
        }),
      )

      await api.post('/widgets')

      expect(hasBody).toBe(false)
    })

    it('allows callers to add headers without dropping the defaults', async () => {
      const headers: Record<string, string | null> = {}
      server.use(
        http.get('/api/widgets', ({ request }) => {
          headers.auth = request.headers.get('authorization')
          headers.contentType = request.headers.get('content-type')
          return HttpResponse.json({})
        }),
      )

      await api.get('/widgets', undefined, {
        headers: { Authorization: 'Bearer token' },
      })

      expect(headers.auth).toBe('Bearer token')
      expect(headers.contentType).toBe('application/json')
    })
  })

  describe('HTTP verbs', () => {
    it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const)(
      'issues a %s request',
      async (method) => {
        let observed: string | undefined
        server.use(
          http.all('/api/widgets', ({ request }) => {
            observed = request.method
            return HttpResponse.json({})
          }),
        )

        const call = {
          GET: () => api.get('/widgets'),
          POST: () => api.post('/widgets', {}),
          PUT: () => api.put('/widgets', {}),
          PATCH: () => api.patch('/widgets', {}),
          DELETE: () => api.delete('/widgets'),
        }[method]

        await call()

        expect(observed).toBe(method)
      },
    )
  })

  describe('responses', () => {
    it('parses a JSON body', async () => {
      server.use(
        http.get('/api/widgets', () =>
          HttpResponse.json({ items: [1, 2, 3] }),
        ),
      )

      await expect(api.get('/widgets')).resolves.toEqual({ items: [1, 2, 3] })
    })

    /*
     * A 204 has no body, so calling response.json() would throw. The client
     * short-circuits — this guards that branch.
     */
    it('returns undefined for a 204 without attempting to parse a body', async () => {
      server.use(
        http.delete('/api/widgets/1', () => new HttpResponse(null, { status: 204 })),
      )

      await expect(api.delete('/widgets/1')).resolves.toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('throws ApiError carrying the status code', async () => {
      server.use(
        http.get('/api/widgets', () =>
          HttpResponse.json({ message: 'Nope' }, { status: 403 }),
        ),
      )

      await expect(api.get('/widgets')).rejects.toBeInstanceOf(ApiError)
      await expect(api.get('/widgets')).rejects.toMatchObject({ status: 403 })
    })

    it("surfaces the server's message when one is provided", async () => {
      server.use(
        http.get('/api/widgets', () =>
          HttpResponse.json(
            { message: 'Reporting period is closed' },
            { status: 422 },
          ),
        ),
      )

      await expect(api.get('/widgets')).rejects.toThrow(
        'Reporting period is closed',
      )
    })

    it('retains the full error payload for callers that need detail', async () => {
      server.use(
        http.get('/api/widgets', () =>
          HttpResponse.json(
            { message: 'Invalid', fields: ['period'] },
            { status: 400 },
          ),
        ),
      )

      await expect(api.get('/widgets')).rejects.toMatchObject({
        body: { message: 'Invalid', fields: ['period'] },
      })
    })

    it('falls back to the status text when the body has no message', async () => {
      server.use(
        http.get('/api/widgets', () =>
          HttpResponse.json({ detail: 'something' }, { status: 500 }),
        ),
      )

      await expect(api.get('/widgets')).rejects.toMatchObject({ status: 500 })
    })

    /*
     * An error response that is not JSON at all (an HTML gateway page, say)
     * must not produce a parse error that masks the real status.
     */
    it('handles a non-JSON error body without throwing a parse error', async () => {
      server.use(
        http.get('/api/widgets', () =>
          HttpResponse.text('<html>502 Bad Gateway</html>', { status: 502 }),
        ),
      )

      await expect(api.get('/widgets')).rejects.toMatchObject({
        status: 502,
        body: undefined,
      })
    })

    it('names the error so it is identifiable in logs', async () => {
      server.use(
        http.get('/api/widgets', () =>
          HttpResponse.json({ message: 'x' }, { status: 400 }),
        ),
      )

      await expect(api.get('/widgets')).rejects.toMatchObject({
        name: 'ApiError',
      })
    })
  })
})
