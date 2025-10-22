'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import { useOrders } from '@/context/OrdersContext'
import CaptainNavbar from '@/components/captain/CaptainNavbar'
import StatsCard from '@/components/captain/StatsCard'
import OrderCard from '@/components/captain/OrderCard'
import { tables } from '@/data/tables'
import toast from 'react-hot-toast'

export default function CaptainDashboardPage() {
  const router = useRouter()
  const { currentCaptain, isAuthenticated } = useCaptain()
  const { orders, updateOrderStatus } = useOrders()
  const [loading, setLoading] = useState(true)

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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Filter orders for captain's assigned tables
  const myTableOrders = orders.filter(order => 
    currentCaptain?.assignedTables.includes(parseInt(order.tableNumber))
  )

  const pendingOrders = myTableOrders.filter(order => order.status === 'pending')
  const activeOrders = myTableOrders.filter(order => 
    ['confirmed', 'preparing', 'ready'].includes(order.status)
  )
  const todayOrders = myTableOrders.filter(order => {
    const orderDate = new Date(order.timestamp).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })

  // Get my tables
  const myTables = tables.filter(table => 
    currentCaptain?.assignedTables.includes(table.number)
  )
  const occupiedTables = myTables.filter(t => t.status === 'occupied').length

  // Calculate today's revenue
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)

  const handleApproveOrder = (order) => {
    updateOrderStatus(order.id, 'confirmed')
    toast.success(`Order ${order.orderNumber} approved!`)
  }

  const handleRejectOrder = (order) => {
    if (confirm(`Are you sure you want to reject order ${order.orderNumber}?`)) {
      updateOrderStatus(order.id, 'rejected')
      toast.error(`Order ${order.orderNumber} rejected`)
    }
  }

  const handleViewDetails = (order) => {
    router.push(`/captain/orders/${order.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <CaptainNavbar />

      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <div className="bg-orange-500 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">
                  Welcome back, {currentCaptain?.name}! 👋
                </h1>
                <p className="text-lg opacity-90">
                  Here&apos;s what&apos;s happening with your tables today
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-5xl">🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Pending Orders"
            value={pendingOrders.length}
            icon="⏳"
            color="yellow"
            subtitle="Awaiting approval"
            trend={pendingOrders.length > 0 ? { isPositive: false, value: `${pendingOrders.length} pending`, label: 'Need attention' } : null}
          />
          <StatsCard
            title="Active Orders"
            value={activeOrders.length}
            icon="🔥"
            color="blue"
            subtitle="In progress"
          />
          <StatsCard
            title="Occupied Tables"
            value={`${occupiedTables}/${myTables.length}`}
            icon="🪑"
            color="purple"
            subtitle="Tables in use"
          />
          <StatsCard
            title="Today's Revenue"
            value={`₹${todayRevenue.toFixed(0)}`}
            icon="💰"
            color="green"
            subtitle={`From ${todayOrders.length} orders`}
          />
        </div>

        {/* Pending Orders Section */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">⏳</span>
                  Pending Approvals
                </h2>
                <p className="text-gray-600 mt-1">{pendingOrders.length} orders waiting for your approval</p>
              </div>
              <button
                onClick={() => router.push('/captain/orders/pending')}
                className="px-4 py-2 bg-white border-2 border-primary-300 rounded-xl text-primary-600 font-medium hover:bg-primary-50 transition-all"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingOrders.slice(0, 2).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onApprove={handleApproveOrder}
                  onReject={handleRejectOrder}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📋</span>
                Recent Orders
              </h2>
              <p className="text-gray-600 mt-1">Latest orders from your tables</p>
            </div>
            <button
              onClick={() => router.push('/captain/orders/active')}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:border-primary-300 hover:text-primary-600 transition-all"
            >
              View All →
            </button>
          </div>

          {myTableOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myTableOrders.slice(0, 4).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onApprove={handleApproveOrder}
                  onReject={handleRejectOrder}
                  onViewDetails={handleViewDetails}
                  showActions={order.status === 'pending'}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📋</span>
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600">
                Orders from your assigned tables will appear here
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/captain/orders/pending')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                  Pending Orders
                </p>
                <p className="text-sm text-gray-600">{pendingOrders.length} waiting</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/captain/tables')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🪑</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                  My Tables
                </p>
                <p className="text-sm text-gray-600">{myTables.length} assigned</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/captain/incentives')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                  Incentives
                </p>
                <p className="text-sm text-gray-600">₹{currentCaptain?.incentivesEarned.toLocaleString()}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}