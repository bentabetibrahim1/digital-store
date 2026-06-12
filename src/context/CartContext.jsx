import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  function updateQty(id, delta) {
    setCart((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? { ...i, qty: i.qty + delta } : i
      )
      return updated.filter((i) => i.qty > 0)
    })
  }

  function clearCart() {
    setCart([])
  }

  const totalCount = cart.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider
      value={{ cart, isOpen, setIsOpen, addToCart, removeFromCart, updateQty, clearCart, totalCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
