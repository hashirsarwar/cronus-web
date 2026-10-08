import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { restaurant } from '../test/builders'
import { RestaurantList } from './RestaurantList'

describe('RestaurantList', () => {
  it('renders each restaurant with its description and address', () => {
    render(
      <RestaurantList
        restaurants={[
          restaurant(),
          restaurant({
            id: 'other',
            name: 'Sakura Sushi Bar',
            description: 'Fresh sushi.',
            addressLine: '48 Riverside Walk',
          }),
        ]}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: "Nonna's Pizzeria" })).toBeInTheDocument()
    expect(screen.getByText('Wood-fired pizza.')).toBeInTheDocument()
    expect(screen.getByText('12 Olive Lane, London')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sakura Sushi Bar' })).toBeInTheDocument()
    expect(screen.getByText('48 Riverside Walk, London')).toBeInTheDocument()
  })

  it('explains the situation when there are no restaurants', () => {
    render(<RestaurantList restaurants={[]} onSelect={vi.fn()} />)

    expect(screen.getByText('No restaurants are available right now.')).toBeInTheDocument()
  })

  it('reports the restaurant whose menu was requested', async () => {
    const onSelect = vi.fn()
    const chosen = restaurant()
    render(<RestaurantList restaurants={[chosen]} onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('button', { name: 'View menu' }))

    expect(onSelect).toHaveBeenCalledWith(chosen)
  })
})
