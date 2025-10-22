'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import { useOrders } from '@/context/OrdersContext'
import CaptainNavbar from '@/components/captain/CaptainNavbar'

export default function IncentivesPage() {
  const router = useRouter()
  const { currentCaptain, isAuthenticated } = useCaptain()
  const { orders } = useOrders()
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
          <p className="text-gray-600">Loading incentives...</p>
        </div>
      </div>
    )
  }

  // Calculate incentives from orders
  const myOrders = orders.filter(order => 
    currentCaptain?.assignedTables.includes(parseInt(order.tableNumber))
  )

  const totalOrders = myOrders.length
  const completedOrders = myOrders.filter(o => o.status === 'completed').length
  const totalRevenue = myOrders.reduce((sum, order) => sum + order.total, 0)

  // Incentive calculation (demo)
  const incentivePerOrder = 50 // ₹50 per order
  const bonusItems = ['Paneer Tikka Masala', 'Biryani Special'] // Special items with bonus
  
  let bonusIncentive = 0
  myOrders.forEach(order => {
    order.items.forEach(item => {
      if (bonusItems.includes(item.name)) {
        bonusIncentive += 20 * item.quantity // ₹20 per special item
      }
    })
  })

  const baseIncentive = completedOrders * incentivePerOrder
  const totalIncentive = baseIncentive + bonusIncentive

  const incentiveBreakdown = [
    {
      id: 1,
      title: 'Base Incentive',
      description: `₹${incentivePerOrder} per completed order`,
      amount: baseIncentive,
      count: completedOrders,
      icon: '📦',
      color: 'blue',
    },
    {
      id: 2,
      title: 'Special Items Bonus',
      description: 'Paneer Tikka, Biryani Special',
      amount: bonusIncentive,
      count: bonusIncentive / 20,
      icon: '⭐',
      color: 'yellow',
    },
    {
      id: 3,
      title: 'Performance Bonus',
      description: 'High rating & quick service',
      amount: 500,
      count: 1,
      icon: '🏆',
      color: 'green',
    },
  ]

  const monthlyTarget = 15000
  const currentEarnings = totalIncentive + 500
  const progressPercentage = (currentEarnings / monthlyTarget) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <CaptainNavbar />

      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center space-x-3 mb-6">
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
                <span className="mr-3">💰</span>
                Incentives Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Track your earnings and performance bonuses
              </p>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-green-100 text-lg mb-2">Total Earnings This Month</p>
                  <p className="font-display text-6xl font-bold">₹{currentEarnings.toLocaleString()}</p>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-5xl">💵</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Monthly Target Progress</span>
                  <span className="font-bold">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-green-100 mt-2">
                  ₹{(monthlyTarget - currentEarnings).toLocaleString()} more to reach target of ₹{monthlyTarget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {completedOrders} completed
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenue Generated</p>
                <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toFixed(0)}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">💸</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              From your tables
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Performance Rating</p>
                <p className="text-3xl font-bold text-gray-900">{currentCaptain?.rating || 4.8}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">⭐</span>
              </div>
            </div>
            <div className="flex text-yellow-400 text-sm">
              ★★★★★
            </div>
          </div>
        </div>

        {/* Incentive Breakdown */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Incentive Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {incentiveBreakdown.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{item.title}</p>
                    <p className="text-3xl font-bold text-gray-900">₹{item.amount}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className={`inline-flex items-center px-3 py-1 bg-${item.color}-50 text-${item.color}-700 rounded-full text-xs font-semibold`}>
                  {item.count} {item.count === 1 ? 'item' : 'items'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Items Bonus List */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            Bonus Items
          </h2>
          
          <p className="text-gray-600 mb-6">
            Earn extra ₹20 for every unit of these special items you sell!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bonusItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item}</p>
                    <p className="text-sm text-gray-600">+₹20 per unit</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold text-sm">
                  BONUS
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings History */}
        <div className="mt-8 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📈</span>
            Recent Earnings
          </h2>

          <div className="space-y-4">
            {[
              { date: 'Today', amount: 850, orders: 17, trend: '+12%' },
              { date: 'Yesterday', amount: 760, orders: 15, trend: '+8%' },
              { date: '2 days ago', amount: 920, orders: 18, trend: '+15%' },
              { date: '3 days ago', amount: 680, orders: 14, trend: '+5%' },
            ].map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{day.date}</p>
                    <p className="text-sm text-gray-600">{day.orders} orders completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{day.amount}</p>
                  <p className="text-sm text-green-600 font-semibold">{day.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}