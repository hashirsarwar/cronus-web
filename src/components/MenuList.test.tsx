import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { menuItem } from '../test/builders'
import { MenuList } from './MenuList'

function renderMenu(props: Partial<Parameters<typeof MenuList>[0]> = {}) {
  const onAdd = vi.fn()
  const onBack = vi.fn()

  render(
    <MenuList
      restaurantName="Nonna's Pizzeria"
      menu={[menuItem()]}
      onAdd={onAdd}
      onBack={onBack}
      pendingMenuItemId={null}
      {...props}
    />,
  )

  return { onAdd, onBack }
}

describe('MenuList', () => {
  it('renders the menu with prices', () => {
    renderMenu()

    expect(screen.getByRole('heading', { name: "Nonna's Pizzeria" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Margherita' })).toBeInTheDocument()
    expect(screen.getByText('£9.50')).toBeInTheDocument()
  })

  it('explains the situation when the menu is empty', () => {
    renderMenu({ menu: [] })

    expect(screen.getByText('This restaurant has no menu items yet.')).toBeInTheDocument()
  })

  it('marks unavailable items and prevents ordering them', () => {
    renderMenu({ menu: [menuItem({ name: 'Sold Out', isAvailable: false })] })

    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeDisabled()
  })

  it('reports the item that was added', async () => {
    const item = menuItem()
    const { onAdd } = renderMenu({ menu: [item] })

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(onAdd).toHaveBeenCalledWith(item)
  })

  it('shows that an item is being added and blocks a duplicate request', () => {
    const item = menuItem()
    renderMenu({ menu: [item], pendingMenuItemId: item.id })

    const button = screen.getByRole('button', { name: 'Adding…' })

    expect(button).toBeDisabled()
  })

  it('returns to the restaurants list on request', async () => {
    const { onBack } = renderMenu()

    await userEvent.click(screen.getByRole('button', { name: 'Back to restaurants' }))

    expect(onBack).toHaveBeenCalled()
  })
})
