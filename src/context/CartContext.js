'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [tableNumber, setTableNumber] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart and table number from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    const savedTable = localStorage.getItem('tableNumber')
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
        localStorage.removeItem('cart')
      }
    }
    
    if (savedTable) {
      setTableNumber(savedTable)
    }
    
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  // Save table number to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && tableNumber) {
      localStorage.setItem('tableNumber', tableNumber)
    }
  }, [tableNumber, isLoaded])

  const addToCart = (item, customization = '') => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id && cartItem.customization === customization
    )

    if (existingItemIndex > -1) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += 1
      setCart(updatedCart)
    } else {
      setCart([...cart, { ...item, quantity: 1, customization }])
    }
  }

  const removeFromCart = (itemId, customization = '') => {
    setCart(cart.filter(item => !(item.id === itemId && item.customization === customization)))
  }

  const updateQuantity = (itemId, customization, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId, customization)
      return
    }
    setCart(
      cart.map(item =>
        item.id === itemId && item.customization === customization
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        tableNumber,
        setTableNumber,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}