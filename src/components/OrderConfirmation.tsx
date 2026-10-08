import { formatPrice } from '../lib/format'
import type { Order } from '../api/types'

interface OrderConfirmationProps {
  order: Order
  onRefresh: () => void
  onStartOver: () => void
  refreshing: boolean
}

export function OrderConfirmation({ order, onRefresh, onStartOver, refreshing }: OrderConfirmationProps) {
  return (
    <section className="confirmation">
      <h2>Order placed</h2>
      <p className="muted">Order ID: {order.id}</p>

      <dl className="summary">
        <div>
          <dt>Restaurant</dt>
          <dd>{order.restaurantName}</dd>
        </div>
        <div>
          <dt>Order status</dt>
          <dd>{order.status}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatPrice(order.totalAmount)}</dd>
        </div>
        <div>
          <dt>Delivery ID</dt>
          <dd>{order.delivery ? order.delivery.id : '—'}</dd>
        </div>
        <div>
          <dt>Delivery status</dt>
          <dd>{order.delivery?.status ?? '—'}</dd>
        </div>
      </dl>

      {order.deliveryFailureReason && (
        <p className="error">Delivery could not be arranged: {order.deliveryFailureReason}</p>
      )}

      <h3>Items</h3>
      <ul className="cart-items">
        {order.items.map((item) => (
          <li key={item.menuItemId}>
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <h3>Delivering to</h3>
      <p className="muted">
        {order.customerName}, {order.addressLine}
        {order.city ? `, ${order.city}` : ''}
        {order.postalCode ? `, ${order.postalCode}` : ''}
      </p>

      <div className="actions">
        <button type="button" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh delivery status'}
        </button>
        <button type="button" className="secondary" onClick={onStartOver}>
          Order again
        </button>
      </div>
    </section>
  )
}
