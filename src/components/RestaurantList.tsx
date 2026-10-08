import type { Restaurant } from '../api/types'

interface RestaurantListProps {
  restaurants: Restaurant[]
  onSelect: (restaurant: Restaurant) => void
}

export function RestaurantList({ restaurants, onSelect }: RestaurantListProps) {
  if (restaurants.length === 0) {
    return <p className="muted">No restaurants are available right now.</p>
  }

  return (
    <ul className="card-grid">
      {restaurants.map((restaurant) => (
        <li key={restaurant.id} className="card">
          <h3>{restaurant.name}</h3>
          {restaurant.description && <p className="muted">{restaurant.description}</p>}
          <p className="muted small">
            {restaurant.addressLine}, {restaurant.city}
          </p>
          <button type="button" onClick={() => onSelect(restaurant)}>
            View menu
          </button>
        </li>
      ))}
    </ul>
  )
}
