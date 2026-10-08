import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { orderingApi } from '../api/ordering'
import type { Cart, CreateOrderRequest, MenuItem, Order, Restaurant } from '../api/types'

export type OrderingStep = 'restaurants' | 'menu' | 'confirmation'

const unexpectedErrorMessage = 'Something went wrong. Please try again.'

function toErrorMessage(cause: unknown): string {
  return cause instanceof ApiError ? cause.message : unexpectedErrorMessage
}

/**
 * Owns every piece of state and every server call for the ordering journey, so the components stay
 * presentational and `App` is left to compose them.
 */
export function useOrderingFlow() {
  const [step, setStep] = useState<OrderingStep>('restaurants')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingMenuItemId, setPendingMenuItemId] = useState<string | null>(null)
  const [pendingCartItemId, setPendingCartItemId] = useState<string | null>(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [refreshingOrder, setRefreshingOrder] = useState(false)


  const guard = useCallback(async (action: () => Promise<void>) => {
    setError(null)

    try {
      await action()
    } catch (cause) {
      setError(toErrorMessage(cause))
    }
  }, [])

  // Avoid guard's synchronous error reset on mount; ignore responses after effect cleanup.
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [restaurantList, openCart] = await Promise.all([
          orderingApi.getRestaurants(),
          orderingApi.getCart(),
        ])

        if (!cancelled) {
          setRestaurants(restaurantList)
          setCart(openCart)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(toErrorMessage(cause))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const selectRestaurant = useCallback(
    (restaurant: Restaurant) =>
      guard(async () => {
        setSelectedRestaurant(restaurant)
        setMenu(await orderingApi.getMenu(restaurant.id))
        setStep('menu')
      }),
    [guard],
  )

  const backToRestaurants = useCallback(() => setStep('restaurants'), [])

  const addToCart = useCallback(
    (menuItem: MenuItem) =>
      guard(async () => {
        setPendingMenuItemId(menuItem.id)

        try {
          setCart(await orderingApi.addCartItem(menuItem.id, 1))
        } finally {
          setPendingMenuItemId(null)
        }
      }),
    [guard],
  )

  const removeFromCart = useCallback(
    (cartItemId: string) =>
      guard(async () => {
        setPendingCartItemId(cartItemId)

        try {
          setCart(await orderingApi.removeCartItem(cartItemId))
        } finally {
          setPendingCartItemId(null)
        }
      }),
    [guard],
  )

  const placeOrder = useCallback(
    (request: CreateOrderRequest) =>
      guard(async () => {
        setPlacingOrder(true)

        try {
          const createdOrder = await orderingApi.createOrder(request)

          setOrder(createdOrder)
          setCart(null)
          setStep('confirmation')
        } finally {
          setPlacingOrder(false)
        }
      }),
    [guard],
  )

  const refreshOrder = useCallback(
    () =>
      guard(async () => {
        if (order === null) {
          return
        }

        setRefreshingOrder(true)

        try {
          setOrder(await orderingApi.getOrder(order.id))
        } finally {
          setRefreshingOrder(false)
        }
      }),
    [guard, order],
  )

  const startOver = useCallback(() => {
    setOrder(null)
    setError(null)
    setStep('restaurants')
  }, [])

  return {
    step,
    restaurants,
    selectedRestaurant,
    menu,
    cart,
    order,
    loading,
    error,
    pendingMenuItemId,
    pendingCartItemId,
    placingOrder,
    refreshingOrder,
    selectRestaurant,
    backToRestaurants,
    addToCart,
    removeFromCart,
    placeOrder,
    refreshOrder,
    startOver,
  }
}
