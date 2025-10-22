'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const OrdersContext = createContext()

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  // Load orders for current table from API
  const loadOrders = async (tableNumber) => {
    if (!tableNumber) return

    try {
      setLoading(true)
      const response = await fetch(`/api/orders?tableNumber=${tableNumber}&sortBy=createdAt&sortOrder=desc`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data.orders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch single order by ID
  const fetchOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const result = await response.json()

      if (result.success) {
        return result.data.order
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    }
    return null
  }

  // Get order from local state or fetch from API
  const getOrderById = async (orderId) => {
    // First check local state
    let order = orders.find(o => o._id === orderId || o.id === orderId)
    
    // If not found locally, fetch from API
    if (!order) {
      order = await fetchOrder(orderId)
      if (order) {
        // Add to local state
        setOrders(prev => [order, ...prev])
      }
    }
    
    return order
  }

  // Refresh order status from API
  const refreshOrderStatus = async (orderId) => {
    try {
      const order = await fetchOrder(orderId)
      if (order) {
        // Update order in state
        setOrders(prev => prev.map(o => 
          (o._id === orderId || o.id === orderId) ? order : o
        ))
        return order
      }
    } catch (error) {
      console.error('Error refreshing order:', error)
    }
    return null
  }

  // Get current order from localStorage (just placed)
  const getCurrentOrder = () => {
    try {
      const savedOrder = localStorage.getItem('currentOrder')
      if (savedOrder) {
        return JSON.parse(savedOrder)
      }
    } catch (error) {
      console.error('Error getting current order:', error)
    }
    return null
  }

  // Clear current order
  const clearCurrentOrder = () => {
    localStorage.removeItem('currentOrder')
  }

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status)
  }

  // Get active orders (not completed or cancelled)
  const getActiveOrders = () => {
    return orders.filter(order => 
      !['completed', 'cancelled'].includes(order.status)
    )
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        loadOrders,
        fetchOrder,
        getOrderById,
        refreshOrderStatus,
        getCurrentOrder,
        clearCurrentOrder,
        getOrdersByStatus,
        getActiveOrders,
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