'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useOrders } from '@/context/OrdersContext'
import Button from '@/components/ui/Button'
import Image from 'next/image'

export default function OrderTrackPage() {
  const router = useRouter()
  const { tableNumber } = useCart()
  const { orders, loadOrders, refreshOrderStatus, loading } = useOrders()
  const [refreshing, setRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (!tableNumber) {
      alert('Please scan the QR code at your table first!')
      router.push('/')
      return
    }

    // Load orders for this table
    loadOrders(tableNumber)
  }, [tableNumber, router, loadOrders])

  // Auto-refresh every 30 seconds for active orders
  useEffect(() => {
    if (!tableNumber || orders.length === 0) return

    const interval = setInterval(async () => {
      // Refresh only active orders
      const activeOrders = orders.filter(order => 
        !['completed', 'cancelled'].includes(order.status)
      )

      for (const order of activeOrders) {
        await refreshOrderStatus(order._id || order.id)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [orders, tableNumber, refreshOrderStatus])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders(tableNumber)
    setRefreshing(false)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      served: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✓',
      preparing: '👨‍🍳',
      ready: '✅',
      served: '🍽️',
      completed: '💚',
      cancelled: '❌',
    }
    return icons[status] || '⏳'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Confirmation',
      confirmed: 'Order Confirmed',
      preparing: 'Being Prepared',
      ready: 'Ready to Serve',
      served: 'Served',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    return texts[status] || status
  }

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { status: 'pending', label: 'Placed', icon: '📝' },
      { status: 'confirmed', label: 'Confirmed', icon: '✓' },
      { status: 'preparing', label: 'Cooking', icon: '👨‍🍳' },
      { status: 'ready', label: 'Ready', icon: '✅' },
      { status: 'served', label: 'Served', icon: '🍽️' },
    ]

    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed']
    const currentIndex = statusOrder.indexOf(currentStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: statusOrder[index] === currentStatus,
    }))
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  // Filter active orders (not completed/cancelled)
  const activeOrders = orders.filter(order => 
    !['completed', 'cancelled'].includes(order.status)
  )

  const pastOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  )

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto container-padding py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="font-display text-xl font-bold">Track Orders</h1>
                <p className="text-sm text-gray-600">Table #{tableNumber}</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              <svg 
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto container-padding py-6">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Active Orders ({activeOrders.length})
            </h2>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div
                  key={order._id || order.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-primary-50 to-orange-50 p-4 border-b border-primary-100">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {getStatusText(order.status)}
                      </div>
                    </div>

                    {/* Status Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        {getStatusSteps(order.status).map((step, index) => (
                          <div key={step.status} className="flex-1 relative">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                step.completed 
                                  ? 'bg-green-500 text-white' 
                                  : step.active
                                  ? 'bg-orange-500 text-white animate-pulse'
                                  : 'bg-gray-200 text-gray-400'
                              }`}>
                                {step.icon}
                              </div>
                              <p className={`text-xs mt-1 font-medium ${
                                step.completed || step.active ? 'text-gray-900' : 'text-gray-400'
                              }`}>
                                {step.label}
                              </p>
                            </div>
                            {index < getStatusSteps(order.status).length - 1 && (
                              <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                                step.completed ? 'bg-green-500' : 'bg-gray-200'
                              }`}></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                      className="w-full flex items-center justify-between text-left mb-3"
                    >
                      <span className="font-semibold text-gray-900">
                        {order.items.length} items • ₹{order.total.toFixed(2)}
                      </span>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${selectedOrder === order._id ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {selectedOrder === order._id && (
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              {item.specialInstructions && (
                                <p className="text-xs text-orange-600 italic mt-1">
                                  Note: {item.specialInstructions}
                                </p>
                              )}
                            </div>
                            <p className="font-semibold text-gray-900">₹{item.subtotal.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
              Past Orders
            </h2>
            <div className="space-y-3">
              {pastOrders.map((order) => (
                <div
                  key={order._id || order.id}
                  className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} items • ₹{order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">📋</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Place your first order to see it here!
            </p>
            <Button variant="primary" onClick={() => router.push('/order/menu')}>
              Browse Menu
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}