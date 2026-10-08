import { useState, type FormEvent } from 'react'
import { formatPrice } from '../lib/format'
import type { Cart, CreateOrderRequest } from '../api/types'

interface CartPanelProps {
  /** Null while there is no open cart. */
  cart: Cart | null
  onRemove: (cartItemId: string) => void
  onPlaceOrder: (order: CreateOrderRequest) => void
  placingOrder: boolean
  pendingCartItemId: string | null
}

export function CartPanel({
  cart,
  onRemove,
  onPlaceOrder,
  placingOrder,
  pendingCartItemId,
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const hasItems = cart !== null && cart.items.length > 0
  const canPlaceOrder =
    hasItems && customerName.trim().length > 0 && addressLine.trim().length > 0 && !placingOrder

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!canPlaceOrder) {
      return
    }

    onPlaceOrder({
      customerName: customerName.trim(),
      addressLine: addressLine.trim(),
      city: city.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
    })
  }

  return (
    <aside className="cart">
      <h2>Your cart</h2>

      {!hasItems ? (
        <p className="muted">Your cart is empty. Add something from the menu.</p>
      ) : (
        <>
          {cart.restaurantName && <p className="muted small">{cart.restaurantName}</p>}
          <ul className="cart-items">
            {cart.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span className="cart-item-right">
                  <span>{formatPrice(item.lineTotal)}</span>
                  <button
                    type="button"
                    className="link"
                    onClick={() => onRemove(item.id)}
                    disabled={pendingCartItemId === item.id}
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="cart-total">
            <strong>Total</strong>
            <strong>{formatPrice(cart.total)}</strong>
          </p>
        </>
      )}

      <form className="order-form" onSubmit={handleSubmit}>
        <h3>Delivery details</h3>
        <label>
          Name
          <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
        </label>
        <label>
          Address
          <input value={addressLine} onChange={(event) => setAddressLine(event.target.value)} required />
        </label>
        <label>
          City
          <input value={city} onChange={(event) => setCity(event.target.value)} />
        </label>
        <label>
          Postcode
          <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
        </label>
        <button type="submit" disabled={!canPlaceOrder}>
          {placingOrder ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </aside>
  )
}
