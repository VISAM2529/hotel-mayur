'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useKitchen } from '@/context/KitchenContext'
import { useOrders } from '@/context/OrdersContext'
import KitchenNavbar from '@/components/kitchen/KitchenNavbar'
import KOTCard from '@/components/kitchen/KOTCard'

export default function KitchenDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, autoRefresh, playNotificationSound } = useKitchen()
  const { orders, updateOrderStatus } = useOrders()
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [previousOrderCount, setPreviousOrderCount] = useState(0)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/kitchen/login')
      return
    }
    setLoading(false)
  }, [isAuthenticated, router])

  // Filter orders that need kitchen attention (confirmed, cooking, ready)
  const kitchenOrders = orders.filter(order => 
    ['confirmed', 'cooking', 'ready'].includes(order.status)
  )

  // Play sound when new order arrives
  useEffect(() => {
    if (kitchenOrders.length > previousOrderCount && previousOrderCount > 0) {
      playNotificationSound()
    }
    setPreviousOrderCount(kitchenOrders.length)
  }, [kitchenOrders.length, previousOrderCount, playNotificationSound])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Force re-render to update timers
      setLoading(false)
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Filter by category
  const filteredOrders = kitchenOrders.filter(order => {
    if (filter === 'all') return true
    return order.items.some(item => 
      item.category.toLowerCase().includes(filter.toLowerCase())
    )
  })

  const handleStatusChange = useCallback((orderId, newKotStatus) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    // Map KOT status to order status
    const statusMap = {
      'cooking': 'cooking',
      'ready': 'ready'
    }

    if (statusMap[newKotStatus]) {
      updateOrderStatus(orderId, statusMap[newKotStatus])
    }
  }, [orders, updateOrderStatus])

  const handlePrint = (order) => {
    setSelectedOrder(order)
    setShowPrintModal(true)
  }

  const printKOT = () => {
    if (!selectedOrder) return
    
    const printWindow = window.open('', '_blank')
    const kotHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>KOT #${selectedOrder.orderNumber}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 20px;
            font-size: 14px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .info {
            margin-bottom: 15px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .notes {
            background: #fffacd;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #000;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            border-top: 2px solid #000;
            padding-top: 10px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍳 KITCHEN ORDER TICKET 🍳</h1>
          <p>Mayur Hotel</p>
        </div>
        
        <div class="info">
          <div class="info-row">
            <strong>KOT #:</strong>
            <span>${selectedOrder.orderNumber}</span>
          </div>
          <div class="info-row">
            <strong>Table #:</strong>
            <span>${selectedOrder.tableNumber}</span>
          </div>
          <div class="info-row">
            <strong>Date & Time:</strong>
            <span>${new Date().toLocaleString()}</span>
          </div>
          ${selectedOrder.isSupplementary ? `
          <div class="info-row" style="color: red;">
            <strong>⚠️ SUPPLEMENTARY KOT</strong>
            <span>Add to existing order</span>
          </div>
          ` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>QTY</th>
              <th>ITEM</th>
              <th>CATEGORY</th>
            </tr>
          </thead>
          <tbody>
            ${selectedOrder.items.map(item => `
              <tr>
                <td><strong>${item.quantity}x</strong></td>
                <td>
                  ${item.name}
                  ${item.specialInstructions ? `<br><i style="color: red;">📝 ${item.specialInstructions}</i>` : ''}
                </td>
                <td>${item.category}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${selectedOrder.notes ? `
          <div class="notes">
            <strong>💬 SPECIAL NOTES:</strong><br>
            ${selectedOrder.notes}
          </div>
        ` : ''}

        <div class="footer">
          <p>Please prepare this order as soon as possible</p>
          <p style="margin-top: 10px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        </div>
        
        <script>
          window.onload = () => {
            window.print();
            // Uncomment to auto-close after printing
            // setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
      </html>
    `
    
    printWindow.document.write(kotHTML)
    printWindow.document.close()
    setShowPrintModal(false)
  }

  const categories = ['all', 'Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages']

  const getStatistics = () => {
    return {
      new: kitchenOrders.filter(o => o.status === 'confirmed').length,
      cooking: kitchenOrders.filter(o => o.status === 'cooking').length,
      ready: kitchenOrders.filter(o => o.status === 'ready').length,
      total: kitchenOrders.length
    }
  }

  const stats = getStatistics()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Kitchen Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KitchenNavbar />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            Kitchen Display System
          </h1>
          <p className="text-gray-600 text-sm ml-11">Active Orders • Real-time Updates</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">New Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Cooking</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.cooking}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Ready</p>
                <p className="text-3xl font-bold text-green-600">{stats.ready}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Active</p>
                <p className="text-3xl font-bold text-orange-600">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === category
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* KOT Cards Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Active Orders
            </h3>
            <p className="text-gray-600">
              All caught up! New orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <KOTCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onPrint={handlePrint}
              />
            ))}
          </div>
        )}
      </div>

      {/* Print Modal */}
      {showPrintModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-6 h-6 mr-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print KOT
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Print Kitchen Order Ticket for Order #{selectedOrder.orderNumber}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={printKOT}
                className="flex-1 px-5 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all shadow-sm"
              >
                Print Now
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}