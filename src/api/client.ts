/** The subset of RFC 9457 problem details the API returns. */
interface ProblemDetails {
  title?: string
  detail?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Keep /api same-origin: Vite proxies it locally and the Gateway routes it in the cluster.
 */
const baseUrl = '/api'

async function send(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }

  return response
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await send(path, init)
  return (await response.json()) as T
}

/** For endpoints that answer 204 No Content when there is nothing to return. */
export async function requestOrNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await send(path, init)
  return response.status === 204 ? null : ((await response.json()) as T)
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}.`

  try {
    const body = (await response.json()) as ProblemDetails
    const fieldError = body.errors ? Object.values(body.errors).flat().at(0) : undefined

    return fieldError ?? body.detail ?? body.title ?? fallback
  } catch {
    return fallback
  }
}
