import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cart, menuItem, order, restaurant } from '../test/builders'
import { jsonResponse, noContentResponse, problemResponse, stubFetch } from '../test/fetchStub'
import { useOrderingFlow } from './useOrderingFlow'

const restaurantId = 'a1000000-0000-0000-0000-000000000001'
const orderId = 'e1000000-0000-0000-0000-000000000001'

const catalogueRoutes = {
  'GET /restaurants': () => jsonResponse([restaurant()]),
  'GET /cart': noContentResponse,
}

async function renderLoadedFlow() {
  const rendered = renderHook(() => useOrderingFlow())
  await waitFor(() => expect(rendered.result.current.loading).toBe(false))
  return rendered
}

describe('useOrderingFlow', () => {
  it('loads restaurants and the open cart on mount', async () => {
    stubFetch({ ...catalogueRoutes, 'GET /cart': () => jsonResponse(cart()) })

    const { result } = await renderLoadedFlow()

    expect(result.current.restaurants).toHaveLength(1)
    expect(result.current.cart?.total).toBe(9.5)
    expect(result.current.error).toBeNull()
  })

  it('treats an absent cart as no cart rather than an error', async () => {
    stubFetch(catalogueRoutes)

    const { result } = await renderLoadedFlow()

    expect(result.current.cart).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('reports a failure while loading', async () => {
    stubFetch({
      ...catalogueRoutes,
      'GET /restaurants': () => problemResponse('Server Error', 'catalogue unavailable', 500),
    })

    const { result } = await renderLoadedFlow()

    expect(result.current.error).toBe('catalogue unavailable')
  })

  it('loads the menu and moves to the menu step when a restaurant is chosen', async () => {
    stubFetch({
      ...catalogueRoutes,
      [`GET /restaurants/${restaurantId}/menu`]: () => jsonResponse([menuItem()]),
    })

    const { result } = await renderLoadedFlow()

    await act(async () => {
      await result.current.selectRestaurant(restaurant())
    })

    expect(result.current.step).toBe('menu')
    expect(result.current.menu).toHaveLength(1)
    expect(result.current.selectedRestaurant?.name).toBe("Nonna's Pizzeria")
  })

  it('returns to the restaurants step when going back', async () => {
    stubFetch({
      ...catalogueRoutes,
      [`GET /restaurants/${restaurantId}/menu`]: () => jsonResponse([menuItem()]),
    })

    const { result } = await renderLoadedFlow()
    await act(async () => {
      await result.current.selectRestaurant(restaurant())
    })

    act(() => result.current.backToRestaurants())

    expect(result.current.step).toBe('restaurants')
  })

  it('updates the cart when an item is added', async () => {
    stubFetch({
      ...catalogueRoutes,
      'POST /cart/items': () => jsonResponse(cart({ total: 19 })),
    })

    const { result } = await renderLoadedFlow()

    await act(async () => {
      await result.current.addToCart(menuItem())
    })

    expect(result.current.cart?.total).toBe(19)
    expect(result.current.pendingMenuItemId).toBeNull()
  })

  it('surfaces the server message when adding an item is rejected', async () => {
    const message = 'The cart already contains items from another restaurant. Remove them first.'
    stubFetch({
      ...catalogueRoutes,
      'POST /cart/items': () => problemResponse('Conflict', message, 409),
    })

    const { result } = await renderLoadedFlow()

    await act(async () => {
      await result.current.addToCart(menuItem())
    })

    expect(result.current.error).toBe(message)
  })

  it('clears the cart and moves to the confirmation step when an order is placed', async () => {
    stubFetch({
      ...catalogueRoutes,
      'GET /cart': () => jsonResponse(cart()),
      'POST /orders': () => jsonResponse(order(), 201),
    })

    const { result } = await renderLoadedFlow()

    await act(async () => {
      await result.current.placeOrder({ customerName: 'Ada Lovelace', addressLine: '1 Analytical Way' })
    })

    expect(result.current.step).toBe('confirmation')
    expect(result.current.order?.status).toBe('Confirmed')
    expect(result.current.order?.delivery?.status).toBe('Pending')
    expect(result.current.cart).toBeNull()
  })

  it('surfaces a failure when the order cannot be placed and leaves the user where they are', async () => {
    stubFetch({
      ...catalogueRoutes,
      'GET /cart': () => jsonResponse(cart()),
      [`GET /restaurants/${restaurantId}/menu`]: () => jsonResponse([menuItem()]),
      'POST /orders': () => problemResponse('Bad Request', 'The cart is empty.', 400),
    })

    const { result } = await renderLoadedFlow()
    await act(async () => {
      await result.current.selectRestaurant(restaurant())
    })

    await act(async () => {
      await result.current.placeOrder({ customerName: 'Ada Lovelace', addressLine: '1 Analytical Way' })
    })

    expect(result.current.error).toBe('The cart is empty.')
    expect(result.current.step).toBe('menu')
    expect(result.current.placingOrder).toBe(false)
  })

  it('re-reads the order when refreshed, so the delivery status can be checked', async () => {
    stubFetch({
      ...catalogueRoutes,
      'GET /cart': () => jsonResponse(cart()),
      'POST /orders': () => jsonResponse(order(), 201),
    })

    const { result } = await renderLoadedFlow()
    await act(async () => {
      await result.current.placeOrder({ customerName: 'Ada Lovelace', addressLine: '1 Analytical Way' })
    })

    stubFetch({
      [`GET /orders/${orderId}`]: () =>
        jsonResponse(order({ delivery: { id: 'f1000000-0000-0000-0000-000000000001', status: 'Delivered' } })),
    })

    await act(async () => {
      await result.current.refreshOrder()
    })

    expect(result.current.order?.delivery?.status).toBe('Delivered')
    expect(result.current.refreshingOrder).toBe(false)
  })

  it('returns to the restaurants step when starting over', async () => {
    stubFetch({
      ...catalogueRoutes,
      'GET /cart': () => jsonResponse(cart()),
      'POST /orders': () => jsonResponse(order(), 201),
    })

    const { result } = await renderLoadedFlow()
    await act(async () => {
      await result.current.placeOrder({ customerName: 'Ada Lovelace', addressLine: '1 Analytical Way' })
    })

    act(() => result.current.startOver())

    expect(result.current.step).toBe('restaurants')
    expect(result.current.order).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
