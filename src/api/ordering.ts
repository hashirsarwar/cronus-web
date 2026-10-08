import { request, requestOrNull } from './client'
import type { Cart, CreateOrderRequest, MenuItem, Order, Restaurant } from './types'

/** Typed wrapper over the ordering service's HTTP API. */
export const orderingApi = {
  getRestaurants: () => request<Restaurant[]>('/restaurants'),

  getMenu: (restaurantId: string) => request<MenuItem[]>(`/restaurants/${restaurantId}/menu`),

  /** Resolves to null while there is no open cart (the service answers 204). */
  getCart: () => requestOrNull<Cart>('/cart'),

  addCartItem: (menuItemId: string, quantity: number) =>
    request<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ menuItemId, quantity }),
    }),

  /** Resolves to null when removing the line emptied the cart and it was discarded. */
  removeCartItem: (cartItemId: string) =>
    requestOrNull<Cart>(`/cart/items/${cartItemId}`, { method: 'DELETE' }),

  createOrder: (order: CreateOrderRequest) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(order) }),

  getOrder: (orderId: string) => request<Order>(`/orders/${orderId}`),
}
