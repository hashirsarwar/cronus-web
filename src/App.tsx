import './App.css'
import { CartPanel } from './components/CartPanel'
import { MenuList } from './components/MenuList'
import { OrderConfirmation } from './components/OrderConfirmation'
import { RestaurantList } from './components/RestaurantList'
import { useOrderingFlow } from './hooks/useOrderingFlow'
import { usePageViewTracking } from './telemetry/usePageViewTracking'

export default function App() {
  const flow = useOrderingFlow()

  // The step is the closest thing this app has to a route, and it is what is reported as a view.
  usePageViewTracking(flow.step)

  return (
    <main className="app">
      <header className="app-header">
        <h1>Cronus</h1>
        <p className="muted">Order from a local restaurant and have it delivered.</p>
      </header>

      {flow.error && (
        <p className="error" role="alert">
          {flow.error}
        </p>
      )}

      {flow.loading ? (
        <p className="muted">Loading restaurants…</p>
      ) : (
        <>
          {flow.step === 'restaurants' && (
            <RestaurantList restaurants={flow.restaurants} onSelect={flow.selectRestaurant} />
          )}

          {flow.step === 'menu' && flow.selectedRestaurant && (
            <div className="menu-layout">
              <MenuList
                restaurantName={flow.selectedRestaurant.name}
                menu={flow.menu}
                onAdd={flow.addToCart}
                onBack={flow.backToRestaurants}
                pendingMenuItemId={flow.pendingMenuItemId}
              />
              <CartPanel
                cart={flow.cart}
                onRemove={flow.removeFromCart}
                onPlaceOrder={flow.placeOrder}
                placingOrder={flow.placingOrder}
                pendingCartItemId={flow.pendingCartItemId}
              />
            </div>
          )}

          {flow.step === 'confirmation' && flow.order && (
            <OrderConfirmation
              order={flow.order}
              onRefresh={flow.refreshOrder}
              onStartOver={flow.startOver}
              refreshing={flow.refreshingOrder}
            />
          )}
        </>
      )}
    </main>
  )
}
