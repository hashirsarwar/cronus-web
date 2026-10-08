import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { order } from '../test/builders'
import { OrderConfirmation } from './OrderConfirmation'

function renderConfirmation(props: Partial<Parameters<typeof OrderConfirmation>[0]> = {}) {
  const onRefresh = vi.fn()
  const onStartOver = vi.fn()

  render(
    <OrderConfirmation
      order={order()}
      onRefresh={onRefresh}
      onStartOver={onStartOver}
      refreshing={false}
      {...props}
    />,
  )

  return { onRefresh, onStartOver }
}

describe('OrderConfirmation', () => {
  it('shows the order, its lines, the total and the delivery it is linked to', () => {
    // Two differently priced lines, so the total cannot be mistaken for a line subtotal.
    renderConfirmation({
      order: order({
        items: [
          { menuItemId: 'b1', name: 'Margherita', unitPrice: 9.5, quantity: 1, lineTotal: 9.5 },
          { menuItemId: 'b2', name: 'Tiramisu', unitPrice: 5.25, quantity: 1, lineTotal: 5.25 },
        ],
        totalAmount: 14.75,
      }),
    })

    expect(screen.getByText('Order ID: e1000000-0000-0000-0000-000000000001')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('1 × Margherita')).toBeInTheDocument()
    expect(screen.getByText('£9.50')).toBeInTheDocument()
    expect(screen.getByText('£5.25')).toBeInTheDocument()
    expect(screen.getByText('£14.75')).toBeInTheDocument()
    expect(screen.getByText('f1000000-0000-0000-0000-000000000001')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace, 1 Analytical Way, London, E1 6AN')).toBeInTheDocument()
  })

  it('shows the delivery failure reason when the delivery could not be arranged', () => {
    renderConfirmation({
      order: order({
        status: 'Placed',
        delivery: null,
        deliveryFailureReason: 'The delivery service is currently unavailable.',
      }),
    })

    expect(
      screen.getByText('Delivery could not be arranged: The delivery service is currently unavailable.'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)
    expect(screen.queryByText('Delivery could not be arranged: null')).not.toBeInTheDocument()
  })

  it('asks for the delivery status to be refreshed', async () => {
    const { onRefresh } = renderConfirmation()

    await userEvent.click(screen.getByRole('button', { name: 'Refresh delivery status' }))

    expect(onRefresh).toHaveBeenCalled()
  })

  it('shows that the refresh is in progress and blocks a duplicate request', () => {
    renderConfirmation({ refreshing: true })

    expect(screen.getByRole('button', { name: 'Refreshing…' })).toBeDisabled()
  })

  it('starts a new order on request', async () => {
    const { onStartOver } = renderConfirmation()

    await userEvent.click(screen.getByRole('button', { name: 'Order again' }))

    expect(onStartOver).toHaveBeenCalled()
  })
})
