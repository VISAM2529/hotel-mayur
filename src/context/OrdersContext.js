'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const OrdersContext = createContext()

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders))
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    }
  }, [])

  // Save orders to localStorage
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('orders', JSON.stringify(orders))
    }
  }, [orders])

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: `ORD${Date.now().toString().slice(-6)}`,
      orderNumber: `ORD${Date.now().toString().slice(-6)}`,
      status: 'pending',
      timestamp: new Date().toISOString(),
      estimatedTime: 25,
    }
    setOrders([newOrder, ...orders])
    return newOrder
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId)
  }

  const clearOrders = () => {
    setOrders([])
    localStorage.removeItem('orders')
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrderById,
        clearOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider')
  }
  return context
}