import { describe, expect, it } from 'vitest'
import {
  jsonResponse,
  noContentResponse,
  nonJsonResponse,
  problemResponse,
  stubFetch,
  validationProblem,
} from '../test/fetchStub'
import { ApiError, request, requestOrNull } from './client'

describe('request', () => {
  it('returns the parsed body for a successful response', async () => {
    stubFetch({ 'GET /restaurants': () => jsonResponse([{ id: '1' }]) })

    await expect(request('/restaurants')).resolves.toEqual([{ id: '1' }])
  })

  it('prefers the first field error from a validation problem', async () => {
    stubFetch({
      'POST /cart/items': () => validationProblem({ quantity: ['quantity must be between 1 and 20.'] }),
    })

    await expect(request('/cart/items', { method: 'POST' })).rejects.toThrow(
      'quantity must be between 1 and 20.',
    )
  })

  it('falls back to the problem detail when there are no field errors', async () => {
    stubFetch({
      'GET /cart': () =>
        problemResponse('Conflict', 'The cart already contains items from another restaurant.', 409),
    })

    await expect(request('/cart')).rejects.toThrow(
      'The cart already contains items from another restaurant.',
    )
  })

  it('falls back to the problem title when there is no detail', async () => {
    stubFetch({ 'GET /cart': () => jsonResponse({ title: 'Not Found', status: 404 }, 404) })

    await expect(request('/cart')).rejects.toThrow('Not Found')
  })

  it('describes the status when the body is not a problem document', async () => {
    stubFetch({ 'GET /cart': () => nonJsonResponse(502) })

    await expect(request('/cart')).rejects.toThrow('Request failed with status 502.')
  })

  it('reports the status code on the error', async () => {
    stubFetch({ 'GET /cart': () => problemResponse('Conflict', 'clash', 409) })

    const error: unknown = await request('/cart').catch((cause: unknown) => cause)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(409)
  })
})

describe('requestOrNull', () => {
  it('returns null for 204 No Content, which is how an absent cart is reported', async () => {
    stubFetch({ 'GET /cart': noContentResponse })

    await expect(requestOrNull('/cart')).resolves.toBeNull()
  })

  it('returns the body when there is one', async () => {
    stubFetch({ 'GET /cart': () => jsonResponse({ total: 9.5 }) })

    await expect(requestOrNull('/cart')).resolves.toEqual({ total: 9.5 })
  })

  it('still rejects an error response', async () => {
    stubFetch({ 'GET /cart': () => problemResponse('Server Error', 'boom', 500) })

    await expect(requestOrNull('/cart')).rejects.toThrow('boom')
  })
})
