import type { Cart, MenuItem, Order, Restaurant } from '../api/types'

/** Builders for the payloads the ordering service returns, so tests state only what they care about. */

export function restaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: "Nonna's Pizzeria",
    description: 'Wood-fired pizza.',
    addressLine: '12 Olive Lane',
    city: 'London',
    ...overrides,
  }
}

export function menuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'b1000000-0000-0000-0000-000000000001',
    restaurantId: 'a1000000-0000-0000-0000-000000000001',
    name: 'Margherita',
    description: 'Tomato, mozzarella, basil.',
    price: 9.5,
    isAvailable: true,
    ...overrides,
  }
}

export function cart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: 'c1000000-0000-0000-0000-000000000001',
    restaurantId: 'a1000000-0000-0000-0000-000000000001',
    restaurantName: "Nonna's Pizzeria",
    status: 'Open',
    items: [
      {
        id: 'd1000000-0000-0000-0000-000000000001',
        menuItemId: 'b1000000-0000-0000-0000-000000000001',
        name: 'Margherita',
        unitPrice: 9.5,
        quantity: 1,
        lineTotal: 9.5,
      },
    ],
    total: 9.5,
    ...overrides,
  }
}

export function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'e1000000-0000-0000-0000-000000000001',
    restaurantId: 'a1000000-0000-0000-0000-000000000001',
    restaurantName: "Nonna's Pizzeria",
    customerName: 'Ada Lovelace',
    addressLine: '1 Analytical Way',
    city: 'London',
    postalCode: 'E1 6AN',
    status: 'Confirmed',
    totalAmount: 9.5,
    createdAt: '2026-10-03T00:00:00+00:00',
    items: [
      {
        menuItemId: 'b1000000-0000-0000-0000-000000000001',
        name: 'Margherita',
        unitPrice: 9.5,
        quantity: 1,
        lineTotal: 9.5,
      },
    ],
    delivery: { id: 'f1000000-0000-0000-0000-000000000001', status: 'Pending' },
    deliveryFailureReason: null,
    ...overrides,
  }
}
