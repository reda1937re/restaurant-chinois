import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  // Chaque ligne : { id, name, price, quantity }
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const add = (dish) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.id === dish.id)
      if (existing) return prev.map((i) => (i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i))
      return [...prev, { id: dish.id, name: dish.name, price: dish.price, quantity: 1 }]
    })

  const setQuantity = (id, quantity) =>
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    )

  const clear = () => setItems([])
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, setQuantity, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
