import { vi } from 'vitest'

/** A stub for one request, keyed in a route table by "<METHOD> <path>". */
export type Route = () => Response

/**
 * Replaces the global fetch with a route table keyed by method and path, so tests describe the
 * server's behaviour rather than the shape of individual calls. Paths are written without the
 * `/api` prefix the client adds.
 */
export function stubFetch(routes: Record<string, Route>) {
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    const path = url.replace(/^\/api/, '')
    const key = `${init?.method ?? 'GET'} ${path}`
    const route = routes[key]

    if (!route) {
      throw new Error(`No stub registered for "${key}". Registered: ${Object.keys(routes).join(', ')}`)
    }

    return route()
  })

  vi.stubGlobal('fetch', mock)

  return mock
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function validationProblem(errors: Record<string, string[]>, status = 400): Response {
  return jsonResponse(
    {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'Bad Request',
      status,
      detail: 'One or more validation errors occurred.',
      errors,
    },
    status,
  )
}

export function problemResponse(title: string, detail: string, status: number): Response {
  return jsonResponse({ title, status, detail }, status)
}

export function noContentResponse(): Response {
  return new Response(null, { status: 204 })
}

/** A response that is not JSON at all, such as an HTML error page from a proxy. */
export function nonJsonResponse(status = 502): Response {
  return new Response('<html>Bad Gateway</html>', {
    status,
    headers: { 'Content-Type': 'text/html' },
  })
}
