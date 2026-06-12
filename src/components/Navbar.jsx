import React from 'react'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar({ storeName, onTrackOrder, onAdminClick }) {
  const { totalCount, setIsOpen } = useCart()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">{storeName}</span>
        </div>
        <div className="navbar-actions">
          <button className="btn btn-ghost" onClick={onTrackOrder}>
            تتبع طلبي
          </button>
          <button className="btn btn-gold" onClick={onAdminClick}>
            لوحة التحكم
          </button>
          <button className="btn btn-cart" onClick={() => setIsOpen(true)}>
            <span className="cart-icon">🛒</span>
            <span>السلة</span>
            {totalCount > 0 && (
              <span className="cart-badge">{totalCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
