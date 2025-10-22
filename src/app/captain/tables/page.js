'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import { useOrders } from '@/context/OrdersContext'
import CaptainNavbar from '@/components/captain/CaptainNavbar'
import TableCard from '@/components/captain/TableCard'
import { tables } from '@/data/tables'

export default function TablesManagementPage() {
  const router = useRouter()
  const { currentCaptain, isAuthenticated } = useCaptain()
  const { orders } = useOrders()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, occupied, vacant, ac, non-ac

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
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    )
  }

  // Get captain's assigned tables
  const myTables = tables.filter(table => 
    currentCaptain?.assignedTables.includes(table.number)
  )

  // Apply filters
  const filteredTables = myTables.filter(table => {
    if (filter === 'occupied') return table.status === 'occupied'
    if (filter === 'vacant') return table.status === 'vacant'
    if (filter === 'ac') return table.type === 'AC'
    if (filter === 'non-ac') return table.type === 'Non-AC'
    return true
  })

  const occupiedCount = myTables.filter(t => t.status === 'occupied').length
  const vacantCount = myTables.filter(t => t.status === 'vacant').length
  const acCount = myTables.filter(t => t.type === 'AC').length
  const nonAcCount = myTables.filter(t => t.type === 'Non-AC').length

  const handleViewTableDetails = (table) => {
    // Find active orders for this table
    const tableOrders = orders.filter(order => 
      parseInt(order.tableNumber) === table.number &&
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    )

    if (tableOrders.length > 0) {
      alert(`Table ${table.number} has ${tableOrders.length} active order(s)`)
    } else {
      alert(`Table ${table.number} is ${table.status}`)
    }
  }

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
                <span className="mr-3">🪑</span>
                My Tables
              </h1>
              <p className="text-gray-600 mt-1">
                {myTables.length} tables assigned to you
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Tables</p>
                <span className="text-2xl">🪑</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{myTables.length}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border-2 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">Occupied</p>
                <span className="text-2xl">🔴</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{occupiedCount}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Vacant</p>
                <span className="text-2xl">🟢</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{vacantCount}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">Occupancy</p>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {myTables.length > 0 ? Math.round((occupiedCount / myTables.length) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All ({myTables.length})
            </button>
            <button
              onClick={() => setFilter('occupied')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'occupied'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🔴 Occupied ({occupiedCount})
            </button>
            <button
              onClick={() => setFilter('vacant')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'vacant'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🟢 Vacant ({vacantCount})
            </button>
            <button
              onClick={() => setFilter('ac')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'ac'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              ❄️ AC ({acCount})
            </button>
            <button
              onClick={() => setFilter('non-ac')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'non-ac'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🌤️ Non-AC ({nonAcCount})
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        {filteredTables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map((table, index) => (
              <div
                key={table.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TableCard
                  table={table}
                  onViewDetails={handleViewTableDetails}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">🔍</span>
            </div>
            <h3 className="font-display text-3xl font-bold text-gray-900 mb-3">
              No Tables Found
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              No tables match the selected filter
            </p>
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all"
            >
              View All Tables
            </button>
          </div>
        )}

        {/* Table Layout Visual */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">🗺️</span>
            Table Layout Overview
          </h2>
          
          <div className="grid grid-cols-5 gap-4">
            {myTables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleViewTableDetails(table)}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all hover:scale-105 ${
                  table.status === 'occupied'
                    ? 'bg-red-100 border-red-400 hover:border-red-500'
                    : 'bg-green-100 border-green-400 hover:border-green-500'
                }`}
              >
                <span className="text-3xl mb-2">🪑</span>
                <p className="font-bold text-sm">{table.number}</p>
                <p className="text-xs text-gray-600">{table.capacity}👥</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Vacant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}