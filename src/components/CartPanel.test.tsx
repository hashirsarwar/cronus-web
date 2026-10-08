import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { cart } from '../test/builders'
import { CartPanel } from './CartPanel'

function renderCart(props: Partial<Parameters<typeof CartPanel>[0]> = {}) {
  const onRemove = vi.fn()
  const onPlaceOrder = vi.fn()

  render(
    <CartPanel
      cart={cart()}
      onRemove={onRemove}
      onPlaceOrder={onPlaceOrder}
      placingOrder={false}
      pendingCartItemId={null}
      {...props}
    />,
  )

  return { onRemove, onPlaceOrder }
}

describe('CartPanel', () => {
  it('explains that the cart is empty when there is no cart', () => {
    renderCart({ cart: null })

    expect(screen.getByText('Your cart is empty. Add something from the menu.')).toBeInTheDocument()
  })

  it('lists the lines with their totals', () => {
    renderCart()

    expect(screen.getByText('1 × Margherita')).toBeInTheDocument()
    expect(screen.getAllByText('£9.50')).toHaveLength(2)
  })

  it('reports the line that was removed', async () => {
    const current = cart()
    const { onRemove } = renderCart({ cart: current })

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(onRemove).toHaveBeenCalledWith(current.items[0].id)
  })

  it('keeps placing an order disabled until the required details are filled in', async () => {
    const user = userEvent.setup()
    renderCart()

    const placeOrder = screen.getByRole('button', { name: 'Place order' })
    expect(placeOrder).toBeDisabled()

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    expect(placeOrder).toBeDisabled()

    await user.type(screen.getByLabelText('Address'), '1 Analytical Way')
    expect(placeOrder).toBeEnabled()
  })

  it('cannot place an order while the cart is empty', () => {
    renderCart({ cart: null })

    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled()
  })

  it('places the order with trimmed details and omits blank optional fields', async () => {
    const user = userEvent.setup()
    const { onPlaceOrder } = renderCart()

    await user.type(screen.getByLabelText('Name'), '  Ada Lovelace  ')
    await user.type(screen.getByLabelText('Address'), ' 1 Analytical Way ')
    await user.type(screen.getByLabelText('City'), '   ')
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(onPlaceOrder).toHaveBeenCalledWith({
      customerName: 'Ada Lovelace',
      addressLine: '1 Analytical Way',
      city: undefined,
      postalCode: undefined,
    })
  })

  it('shows that the order is being placed and blocks a duplicate submission', () => {
    renderCart({ placingOrder: true })

    const placeOrder = screen.getByRole('button', { name: 'Placing order…' })

    expect(placeOrder).toBeDisabled()
  })
})
