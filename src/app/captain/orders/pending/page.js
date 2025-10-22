'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import { useOrders } from '@/context/OrdersContext'
import CaptainNavbar from '@/components/captain/CaptainNavbar'
import OrderCard from '@/components/captain/OrderCard'
import toast from 'react-hot-toast'

export default function PendingOrdersPage() {
  const router = useRouter()
  const { currentCaptain, isAuthenticated } = useCaptain()
  const { orders, updateOrderStatus } = useOrders()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, ac, non-ac

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/captain/login')
      return
    }
    setLoading(false)
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  // Filter orders for captain's assigned tables and pending status
  const pendingOrders = orders.filter(order => 
    currentCaptain?.assignedTables.includes(parseInt(order.tableNumber)) &&
    order.status === 'pending'
  )

  const handleApproveOrder = (order) => {
    if (confirm(`Approve order ${order.orderNumber} from Table ${order.tableNumber}?`)) {
      updateOrderStatus(order.id, 'confirmed')
      toast.success(
        <div>
          <p className="font-bold">Order Approved! ✅</p>
          <p className="text-sm">KOT sent to kitchen</p>
        </div>,
        { duration: 4000 }
      )
    }
  }

  const handleRejectOrder = (order) => {
    const reason = prompt(`Reason for rejecting order ${order.orderNumber}?`)
    if (reason) {
      updateOrderStatus(order.id, 'rejected')
      toast.error(
        <div>
          <p className="font-bold">Order Rejected</p>
          <p className="text-sm">Customer will be notified</p>
        </div>,
        { duration: 4000 }
      )
    }
  }

  const handleViewDetails = (order) => {
    // For now, we'll just show an alert. You can create a detailed view page later
    router.push(`/captain/orders/${order.id}`)
  }

  const handleApproveAll = () => {
    if (pendingOrders.length === 0) return
    
    if (confirm(`Approve all ${pendingOrders.length} pending orders?`)) {
      pendingOrders.forEach(order => {
        updateOrderStatus(order.id, 'confirmed')
      })
      toast.success(`${pendingOrders.length} orders approved!`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <CaptainNavbar />

      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
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
                  <span className="mr-3">⏳</span>
                  Pending Orders
                </h1>
                <p className="text-gray-600 mt-1">
                  {pendingOrders.length} {pendingOrders.length === 1 ? 'order' : 'orders'} awaiting your approval
                </p>
              </div>
            </div>

            {pendingOrders.length > 0 && (
              <button
                onClick={handleApproveAll}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
              >
                Approve All ({pendingOrders.length})
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center space-x-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Orders ({pendingOrders.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'urgent'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🔥 Urgent
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'recent'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🕐 Recent
          </button>
        </div>

        {/* Orders Grid */}
        {pendingOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingOrders.map((order, index) => (
              <div
                key={order.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <OrderCard
                  order={order}
                  onApprove={handleApproveOrder}
                  onReject={handleRejectOrder}
                  onViewDetails={handleViewDetails}
                  showActions={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl">
            <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">✅</span>
            </div>
            <h3 className="font-display text-3xl font-bold text-gray-900 mb-3">
              All Caught Up!
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              No pending orders at the moment. Great job! 🎉
            </p>
            <button
              onClick={() => router.push('/captain/dashboard')}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Quick Stats */}
        {pendingOrders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{pendingOrders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{pendingOrders.length > 0 
                      ? (pendingOrders.reduce((sum, order) => sum + order.total, 0) / pendingOrders.length).toFixed(0)
                      : 0
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}