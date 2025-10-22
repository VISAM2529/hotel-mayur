'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import CaptainNavbar from '@/components/captain/CaptainNavbar'
import OrderCard from '@/components/captain/OrderCard'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    icon: '✅',
    color: 'blue',
    nextStatus: 'preparing',
    nextLabel: 'Mark as Preparing'
  },
  preparing: {
    label: 'Preparing',
    icon: '👨‍🍳',
    color: 'orange',
    nextStatus: 'ready',
    nextLabel: 'Mark as Ready'
  },
  ready: {
    label: 'Ready',
    icon: '🔔',
    color: 'purple',
    nextStatus: 'served',
    nextLabel: 'Mark as Served'
  }
}

export default function ActiveOrdersPage() {
  const router = useRouter()
  const { currentCaptain, isAuthenticated, loading, captainFetch } = useCaptain()
  const [dataLoading, setDataLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/captain/login')
      return
    }

    if (isAuthenticated) {
      fetchActiveOrders()
    }
  }, [isAuthenticated, loading, router])

  const fetchActiveOrders = async () => {
    try {
      setDataLoading(true)

      // Fetch orders with active statuses
      const response = await captainFetch('/api/orders?kitchenStatus=true&sortBy=createdAt&sortOrder=desc')
      const data = await response.json()

      if (data.success) {
        setOrders(data.data.orders)
      } else {
        toast.error('Failed to load orders')
      }

      setDataLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
      setDataLoading(false)
    }
  }

  const handleUpdateStatus = async (order, newStatus) => {
    try {
      const response = await captainFetch(`/api/orders/${order._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        const statusConfig = STATUS_CONFIG[newStatus]
        toast.success(`Order ${order.orderNumber} marked as ${statusConfig?.label || newStatus}`)
        fetchActiveOrders()
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleMarkAsServed = async (order) => {
    if (confirm(`Mark order ${order.orderNumber} as served?`)) {
      try {
        const response = await captainFetch(`/api/orders/${order._id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'served' })
        })

        const result = await response.json()

        if (result.success) {
          toast.success(
            <div>
              <p className="font-bold">Order Served! 🍽️</p>
              <p className="text-sm">Table {order.tableNumber} - Enjoy your meal!</p>
            </div>
          )
          fetchActiveOrders()
        } else {
          toast.error(result.error || 'Failed to mark as served')
        }
      } catch (error) {
        console.error('Error marking as served:', error)
        toast.error('Failed to mark as served')
      }
    }
  }

  const handleViewDetails = (order) => {
    router.push(`/captain/orders/${order._id}`)
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  const statusCounts = {
    all: orders.length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <CaptainNavbar />

      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-primary-300 transition-all"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">🔥</span>
                Active Orders
              </h1>
              <p className="text-gray-600 mt-1">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} in progress
              </p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold transition-all ${
                selectedStatus === 'all'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Orders ({statusCounts.all})
            </button>
            <button
              onClick={() => setSelectedStatus('confirmed')}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold transition-all ${
                selectedStatus === 'confirmed'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              ✅ Confirmed ({statusCounts.confirmed})
            </button>
            <button
              onClick={() => setSelectedStatus('preparing')}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold transition-all ${
                selectedStatus === 'preparing'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              👨‍🍳 Cooking ({statusCounts.preparing})
            </button>
            <button
              onClick={() => setSelectedStatus('ready')}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold transition-all ${
                selectedStatus === 'ready'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🔔 Ready ({statusCounts.ready})
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                  <OrderCard
                    order={order}
                    onViewDetails={handleViewDetails}
                    showActions={false}
                  />
                  
                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(order, 'preparing')}
                        className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                      >
                        👨‍🍳 Mark as Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order, 'ready')}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
                      >
                        🔔 Mark as Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleMarkAsServed(order)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                      >
                        🍽️ Mark as Served
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">
                {selectedStatus === 'all' ? '🔍' : STATUS_CONFIG[selectedStatus]?.icon || '📋'}
              </span>
            </div>
            <h3 className="font-display text-3xl font-bold text-gray-900 mb-3">
              No {selectedStatus !== 'all' ? STATUS_CONFIG[selectedStatus]?.label : 'Active'} Orders
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {selectedStatus === 'all' 
                ? 'All orders have been completed!'
                : `No orders in ${STATUS_CONFIG[selectedStatus]?.label} status`
              }
            </p>
            <button
              onClick={() => setSelectedStatus('all')}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all"
            >
              View All Orders
            </button>
          </div>
        )}
      </div>
    </div>
  )
}