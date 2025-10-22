'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import CaptainNavbar from '@/components/captain/CaptainNavbar'
import OrderCard from '@/components/captain/OrderCard'
import toast from 'react-hot-toast'

export default function PendingOrdersPage() {
  const router = useRouter()
  const { currentCaptain, isAuthenticated, loading, captainFetch } = useCaptain()
  const [dataLoading, setDataLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all') // all, urgent, recent

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/captain/login')
      return
    }

    if (isAuthenticated) {
      fetchPendingOrders()
    }
  }, [isAuthenticated, loading, router])

  const fetchPendingOrders = async () => {
    try {
      setDataLoading(true)

      const response = await captainFetch('/api/orders?status=pending&sortBy=createdAt&sortOrder=desc')
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

  const handleApproveOrder = async (order) => {
    if (confirm(`Approve order ${order.orderNumber} from Table ${order.tableNumber}?`)) {
      try {
        const response = await captainFetch(`/api/orders/${order._id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'confirmed' })
        })

        const result = await response.json()

        if (result.success) {
          toast.success(
            <div>
              <p className="font-bold">Order Approved! ✅</p>
              <p className="text-sm">KOT sent to kitchen</p>
            </div>,
            { duration: 4000 }
          )
          fetchPendingOrders()
        } else {
          toast.error(result.error || 'Failed to approve order')
        }
      } catch (error) {
        console.error('Error approving order:', error)
        toast.error('Failed to approve order')
      }
    }
  }

  const handleRejectOrder = async (order) => {
    const reason = prompt(`Reason for rejecting order ${order.orderNumber}?`)
    if (reason) {
      try {
        const response = await captainFetch(`/api/orders/${order._id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ 
            status: 'rejected',
            rejectionReason: reason
          })
        })

        const result = await response.json()

        if (result.success) {
          toast.error(
            <div>
              <p className="font-bold">Order Rejected</p>
              <p className="text-sm">Customer will be notified</p>
            </div>,
            { duration: 4000 }
          )
          fetchPendingOrders()
        } else {
          toast.error(result.error || 'Failed to reject order')
        }
      } catch (error) {
        console.error('Error rejecting order:', error)
        toast.error('Failed to reject order')
      }
    }
  }

  const handleViewDetails = (order) => {
    router.push(`/captain/orders/${order._id}`)
  }

  const handleApproveAll = async () => {
    if (orders.length === 0) return
    
    if (confirm(`Approve all ${orders.length} pending orders?`)) {
      try {
        const promises = orders.map(order =>
          captainFetch(`/api/orders/${order._id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'confirmed' })
          })
        )

        await Promise.all(promises)
        toast.success(`${orders.length} orders approved!`)
        fetchPendingOrders()
      } catch (error) {
        console.error('Error approving all orders:', error)
        toast.error('Failed to approve all orders')
      }
    }
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

  const filteredOrders = orders.filter(order => {
    if (filter === 'urgent') {
      // Orders older than 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      return new Date(order.createdAt) < tenMinutesAgo
    }
    if (filter === 'recent') {
      // Orders from last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return new Date(order.createdAt) >= fiveMinutesAgo
    }
    return true
  })

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
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} awaiting your approval
                </p>
              </div>
            </div>

            {orders.length > 0 && (
              <button
                onClick={handleApproveAll}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
              >
                Approve All ({orders.length})
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
            All Orders ({orders.length})
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
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id}
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
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
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
                    ₹{orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(0)}
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
                    ₹{orders.length > 0 
                      ? (orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length).toFixed(0)
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