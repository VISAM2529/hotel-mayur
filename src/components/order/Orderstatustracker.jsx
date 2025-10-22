'use client'

import { useState } from 'react'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    description: 'Waiting for captain approval'
  },
  confirmed: {
    label: 'Confirmed',
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-800',
    description: 'Order confirmed by captain'
  },
  preparing: {
    label: 'Preparing',
    icon: '👨‍🍳',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-800',
    description: 'Chef is cooking your food'
  },
  ready: {
    label: 'Ready',
    icon: '🔔',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-800',
    description: 'Food is ready for serving'
  },
  served: {
    label: 'Served',
    icon: '🍽️',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800',
    description: 'Enjoy your meal!'
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-800',
    description: 'Order was cancelled'
  }
}

export default function OrderStatusTracker({ orders, loading, onRefresh, tableNumber }) {
  const [expandedOrder, setExpandedOrder] = useState(null)

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-12 border-2 border-gray-200 shadow-lg text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">📋</span>
        </div>
        <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
          No Orders Yet
        </h3>
        <p className="text-gray-600 text-lg mb-6">
          Start browsing our menu and place your first order!
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-sm text-blue-700">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Your orders will appear here
        </div>
      </div>
    )
  }

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status))
  const completedOrders = orders.filter(o => ['served'].includes(o.status))
  const rejectedOrders = orders.filter(o => o.status === 'rejected')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
            <span className="mr-3">📋</span>
            Your Orders
          </h2>
          <p className="text-gray-600 mt-1">Track your food orders in real-time</p>
        </div>
        <button
          onClick={onRefresh}
          className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 group-hover:rotate-180 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg text-gray-900">Active Orders</h3>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-full text-xs font-bold text-blue-700">
              {activeOrders.length} in progress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                expanded={expandedOrder === order._id}
                onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg text-gray-900">Completed</h3>
            <span className="px-3 py-1 bg-green-100 border border-green-200 rounded-full text-xs font-bold text-green-700">
              {completedOrders.length} served
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                expanded={expandedOrder === order._id}
                onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Orders */}
      {rejectedOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg text-gray-900">Cancelled</h3>
            <span className="px-3 py-1 bg-red-100 border border-red-200 rounded-full text-xs font-bold text-red-700">
              {rejectedOrders.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rejectedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                expanded={expandedOrder === order._id}
                onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, expanded, onToggle }) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`bg-white rounded-2xl border-2 ${statusConfig.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      {/* Header */}
      <div className={`${statusConfig.bgColor} p-4 border-b-2 ${statusConfig.borderColor}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-bold text-lg text-gray-900">
                Order #{order.orderNumber}
              </h4>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.badgeColor}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
            <p className={`text-sm font-medium ${statusConfig.textColor}`}>
              {statusConfig.description}
            </p>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{formatTime(order.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="p-4">
        <div className="space-y-2 mb-3">
          {order.items.slice(0, expanded ? undefined : 2).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 flex-1">
                <span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-700">
                  {item.quantity}×
                </span>
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              <span className="font-bold text-gray-700">₹{item.price * item.quantity}</span>
            </div>
          ))}
          
          {!expanded && order.items.length > 2 && (
            <button
              onClick={onToggle}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              + {order.items.length - 2} more items
            </button>
          )}
        </div>

        {/* Total */}
        <div className="pt-3 border-t-2 border-gray-100">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">Total Amount</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ₹{order.total}
            </span>
          </div>
        </div>

        {/* Rejection Reason */}
        {order.status === 'rejected' && order.rejectionReason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-700 mb-1">Cancellation Reason:</p>
            <p className="text-sm text-red-600">{order.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Status Progress Bar */}
      {['pending', 'confirmed', 'preparing', 'ready'].includes(order.status) && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Order Progress</span>
            <span className="text-xs font-bold text-blue-600">
              {order.status === 'pending' && '25%'}
              {order.status === 'confirmed' && '50%'}
              {order.status === 'preparing' && '75%'}
              {order.status === 'ready' && '100%'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                order.status === 'pending' ? 'w-1/4 bg-yellow-500' :
                order.status === 'confirmed' ? 'w-1/2 bg-green-500' :
                order.status === 'preparing' ? 'w-3/4 bg-orange-500' :
                'w-full bg-purple-500'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  )
}