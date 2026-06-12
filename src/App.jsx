import React, { useState } from 'react'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/Navbar'
import CartSidebar from './components/CartSidebar'
import OrderSuccessModal from './components/OrderSuccessModal'
import AdminLogin from './components/AdminLogin'
import StorePage from './pages/StorePage'
import TrackingPage from './pages/TrackingPage'
import AdminPage from './pages/AdminPage'

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'متجري الرقمي'

// Views
const VIEW_STORE    = 'store'
const VIEW_TRACKING = 'tracking'
const VIEW_ADMIN    = 'admin'

export default function App() {
  const [view, setView]             = useState(VIEW_STORE)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState(null)

  function handleOrderPlaced(orderId) {
    setSuccessOrderId(orderId)
  }

  function handleTrackFromSuccess() {
    setSuccessOrderId(null)
    setView(VIEW_TRACKING)
  }

  return (
    <ToastProvider>
      <CartProvider>
        {view === VIEW_ADMIN ? (
          <AdminPage onExit={() => setView(VIEW_STORE)} />
        ) : (
          <>
            <Navbar
              storeName={STORE_NAME}
              onTrackOrder={() => setView(VIEW_TRACKING)}
              onAdminClick={() => setShowAdminLogin(true)}
            />

            {view === VIEW_STORE && (
              <StorePage storeName={STORE_NAME} />
            )}

            {view === VIEW_TRACKING && (
              <TrackingPage onBack={() => setView(VIEW_STORE)} />
            )}

            <CartSidebar onOrderPlaced={handleOrderPlaced} />
          </>
        )}

        {/* Modals */}
        {successOrderId && (
          <OrderSuccessModal
            orderId={successOrderId}
            onTrack={handleTrackFromSuccess}
            onClose={() => setSuccessOrderId(null)}
          />
        )}

        {showAdminLogin && (
          <AdminLogin
            onSuccess={() => { setShowAdminLogin(false); setView(VIEW_ADMIN) }}
            onClose={() => setShowAdminLogin(false)}
          />
        )}
      </CartProvider>
    </ToastProvider>
  )
}
