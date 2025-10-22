'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import CaptainNavbar from '@/components/captain/CaptainNavbar'
import StatsCard from '@/components/captain/StatsCard'
import OrderCard from '@/components/captain/OrderCard'
import toast from 'react-hot-toast'

export default function CaptainDashboardPage() {
  const router = useRouter()
  const { currentCaptain, isAuthenticated, loading, captainFetch } = useCaptain()
  const [dataLoading, setDataLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [stats, setStats] = useState({
    pendingOrders: 0,
    activeOrders: 0,
    occupiedTables: 0,
    todayRevenue: 0,
    todayOrders: 0
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/captain/login')
      return
    }

    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated, loading, router])

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true)

      // Fetch orders
      const ordersResponse = await captainFetch('/api/orders?limit=100')
      const ordersData = await ordersResponse.json()

      if (ordersData.success) {
        setOrders(ordersData.data.orders)
        calculateStats(ordersData.data.orders)
      }

      // Fetch tables
      const tablesResponse = await captainFetch('/api/tables')
      const tablesData = await tablesResponse.json()

      if (tablesData.success) {
        setTables(tablesData.data.tables)
      }

      setDataLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard')
      setDataLoading(false)
    }
  }

  const calculateStats = (ordersData) => {
    const pending = ordersData.filter(o => o.status === 'pending').length
    const active = ordersData.filter(o => 
      ['confirmed', 'preparing', 'ready'].includes(o.status)
    ).length

    // Today's orders
    const today = new Date().toDateString()
    const todayOrders = ordersData.filter(o => 
      new Date(o.createdAt).toDateString() === today
    )

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)

    setStats({
      pendingOrders: pending,
      activeOrders: active,
      occupiedTables: tables.filter(t => t.status === 'occupied').length,
      todayRevenue,
      todayOrders: todayOrders.length
    })
  }

  const handleApproveOrder = async (order) => {
    try {
      const response = await captainFetch(`/api/orders/${order._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed' })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Order ${order.orderNumber} approved!`)
        fetchDashboardData() // Refresh data
      } else {
        toast.error(result.error || 'Failed to approve order')
      }
    } catch (error) {
      console.error('Error approving order:', error)
      toast.error('Failed to approve order')
    }
  }

  const handleRejectOrder = async (order) => {
    if (confirm(`Are you sure you want to reject order ${order.orderNumber}?`)) {
      try {
        const response = await captainFetch(`/api/orders/${order._id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'rejected' })
        })

        const result = await response.json()

        if (result.success) {
          toast.error(`Order ${order.orderNumber} rejected`)
          fetchDashboardData()
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

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const recentOrders = orders.slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <CaptainNavbar />

      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">
                  Welcome back, {currentCaptain?.name}! 👋
                </h1>
                <p className="text-lg opacity-90">
                  Here&apos;s what&apos;s happening today
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-5xl">🧑‍✈️</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon="⏳"
            color="yellow"
            subtitle="Awaiting approval"
            trend={stats.pendingOrders > 0 ? { 
              isPositive: false, 
              value: `${stats.pendingOrders} pending`, 
              label: 'Need attention' 
            } : null}
          />
          <StatsCard
            title="Active Orders"
            value={stats.activeOrders}
            icon="🔥"
            color="blue"
            subtitle="In progress"
          />
          <StatsCard
            title="Occupied Tables"
            value={`${stats.occupiedTables}/${tables.length}`}
            icon="🪑"
            color="purple"
            subtitle="Tables in use"
          />
          <StatsCard
            title="Today's Revenue"
            value={`₹${stats.todayRevenue.toFixed(0)}`}
            icon="💰"
            color="green"
            subtitle={`From ${stats.todayOrders} orders`}
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
                  key={order._id}
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
              <p className="text-gray-600 mt-1">Latest orders</p>
            </div>
            <button
              onClick={() => router.push('/captain/orders/active')}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:border-primary-300 hover:text-primary-600 transition-all"
            >
              View All →
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentOrders.map((order) => (
                <OrderCard
                  key={order._id}
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
                Orders will appear here
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
                <p className="text-sm text-gray-600">{stats.pendingOrders} waiting</p>
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
                  Tables
                </p>
                <p className="text-sm text-gray-600">{tables.length} total</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/captain/profile')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                  Profile
                </p>
                <p className="text-sm text-gray-600">{currentCaptain?.role}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}