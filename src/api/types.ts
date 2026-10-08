/** Mirrors the ordering service contracts. */

export type CartStatus = 'Open' | 'Converted'

export type OrderStatus = 'Placed' | 'Confirmed'

export interface Restaurant {
  id: string
  name: string
  description: string | null
  addressLine: string
  city: string
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description: string | null
  price: number
  isAvailable: boolean
}

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

/** The server always describes a real cart; "no cart" is represented by null, never a placeholder. */
export interface Cart {
  id: string
  restaurantId: string | null
  restaurantName: string | null
  status: CartStatus
  items: CartItem[]
  total: number
}

export interface OrderItem {
  menuItemId: string
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface DeliveryInfo {
  id: string
  status: string | null
}

export interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  customerName: string
  addressLine: string
  city: string | null
  postalCode: string | null
  status: OrderStatus
  totalAmount: number
  createdAt: string
  items: OrderItem[]
  delivery: DeliveryInfo | null
  deliveryFailureReason: string | null
}

export interface CreateOrderRequest {
  customerName: string
  addressLine: string
  city?: string
  postalCode?: string
}
