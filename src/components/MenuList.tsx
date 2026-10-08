import { formatPrice } from '../lib/format'
import type { MenuItem } from '../api/types'

interface MenuListProps {
  restaurantName: string
  menu: MenuItem[]
  onAdd: (menuItem: MenuItem) => void
  onBack: () => void
  pendingMenuItemId: string | null
}

export function MenuList({ restaurantName, menu, onAdd, onBack, pendingMenuItemId }: MenuListProps) {
  return (
    <section>
      <div className="section-header">
        <h2>{restaurantName}</h2>
        <button type="button" className="secondary" onClick={onBack}>
          Back to restaurants
        </button>
      </div>

      {menu.length === 0 ? (
        <p className="muted">This restaurant has no menu items yet.</p>
      ) : (
        <ul className="menu-list">
          {menu.map((item) => (
            <li key={item.id} className="menu-item">
              <div>
                <h3>
                  {item.name}
                  {!item.isAvailable && <span className="badge">Unavailable</span>}
                </h3>
                {item.description && <p className="muted">{item.description}</p>}
              </div>
              <div className="menu-item-actions">
                <span className="price">{formatPrice(item.price)}</span>
                <button
                  type="button"
                  onClick={() => onAdd(item)}
                  disabled={!item.isAvailable || pendingMenuItemId === item.id}
                >
                  {pendingMenuItemId === item.id ? 'Adding…' : 'Add to cart'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
