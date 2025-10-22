'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useOrders } from '@/context/OrdersContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import toast from 'react-hot-toast'

export default function SalesReportsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAdmin()
  const { orders } = useOrders()
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/admin/login')
//       return
//     }
//     setLoading(false)
//   }, [isAuthenticated, router])

  // Sample sales data (replace with real data from your database)
  const [salesData, setSalesData] = useState([
    { id: 1, billNo: 'BILL-001', date: '2025-10-21 12:30', table: '5', customer: 'Rahul Sharma', items: 4, subtotal: 850, acCharge: 170, discount: 0, total: 1020, paymentMode: 'cash', cashAmount: 1020, onlineAmount: 0, waiter: 'Suresh' },
    { id: 2, billNo: 'BILL-002', date: '2025-10-21 13:15', table: '3', customer: 'Priya Patel', items: 3, subtotal: 620, acCharge: 0, discount: 31, total: 589, paymentMode: 'online', cashAmount: 0, onlineAmount: 589, waiter: 'Ramesh' },
    { id: 3, billNo: 'BILL-003', date: '2025-10-21 13:45', table: '8', customer: 'Amit Kumar', items: 6, subtotal: 1200, acCharge: 240, discount: 72, total: 1368, paymentMode: 'split', cashAmount: 700, onlineAmount: 668, waiter: 'Suresh' },
    { id: 4, billNo: 'BILL-004', date: '2025-10-21 14:20', table: '2', customer: 'Guest', items: 2, subtotal: 340, acCharge: 0, discount: 0, total: 340, paymentMode: 'cash', cashAmount: 340, onlineAmount: 0, waiter: 'Ramesh' },
    { id: 5, billNo: 'BILL-005', date: '2025-10-21 15:00', table: '12', customer: 'Sneha Desai', items: 5, subtotal: 980, acCharge: 196, discount: 0, total: 1176, paymentMode: 'online', cashAmount: 0, onlineAmount: 1176, waiter: 'Suresh' },
    { id: 6, billNo: 'BILL-006', date: '2025-10-21 15:30', table: '7', customer: 'Vikram Singh', items: 3, subtotal: 560, acCharge: 112, discount: 34, total: 638, paymentMode: 'cash', cashAmount: 638, onlineAmount: 0, waiter: 'Ramesh' },
    { id: 7, billNo: 'BILL-007', date: '2025-10-21 16:15', table: '1', customer: 'Anita Joshi', items: 4, subtotal: 720, acCharge: 0, discount: 0, total: 720, paymentMode: 'online', cashAmount: 0, onlineAmount: 720, waiter: 'Suresh' },
    { id: 8, billNo: 'BILL-008', date: '2025-10-21 17:00', table: '10', customer: 'Guest', items: 2, subtotal: 280, acCharge: 56, discount: 0, total: 336, paymentMode: 'split', cashAmount: 200, onlineAmount: 136, waiter: 'Ramesh' },
  ])

  // Top selling items
  const topItems = [
    { name: 'Butter Chicken', icon: '🍗', orders: 45, revenue: 12600 },
    { name: 'Paneer Tikka', icon: '🧀', orders: 38, revenue: 6840 },
    { name: 'Dal Makhani', icon: '🍲', orders: 32, revenue: 6400 },
    { name: 'Butter Naan', icon: '🫓', orders: 67, revenue: 2680 },
    { name: 'Fresh Lime Soda', icon: '🍋', orders: 29, revenue: 1740 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0)
  const totalOrders = salesData.length
  const totalCash = salesData.reduce((sum, sale) => sum + sale.cashAmount, 0)
  const totalOnline = salesData.reduce((sum, sale) => sum + sale.onlineAmount, 0)
  const totalDiscount = salesData.reduce((sum, sale) => sum + sale.discount, 0)
  const totalACRevenue = salesData.reduce((sum, sale) => sum + sale.acCharge, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Payment mode breakdown
  const cashOrders = salesData.filter(s => s.paymentMode === 'cash').length
  const onlineOrders = salesData.filter(s => s.paymentMode === 'online').length
  const splitOrders = salesData.filter(s => s.paymentMode === 'split').length

  // Waiter performance
  const waiterStats = salesData.reduce((acc, sale) => {
    if (!acc[sale.waiter]) {
      acc[sale.waiter] = { orders: 0, revenue: 0 }
    }
    acc[sale.waiter].orders += 1
    acc[sale.waiter].revenue += sale.total
    return acc
  }, {})

  const handleExportReport = () => {
    toast.success('Report exported successfully!')
  }

  const handlePrintReport = () => {
    window.print()
    toast.success('Printing report...')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
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
                      <span className="mr-3">📊</span>
                      Sales Reports & Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Track revenue, orders, and performance metrics</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-primary-300 transition-all flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print</span>
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Date Filter */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-gray-700">📅 Period:</p>
                  <button
                    onClick={() => setDateFilter('today')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      dateFilter === 'today'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateFilter('yesterday')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      dateFilter === 'yesterday'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => setDateFilter('week')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      dateFilter === 'week'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setDateFilter('month')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      dateFilter === 'month'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setDateFilter('custom')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      dateFilter === 'custom'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Custom Range
                  </button>
                  
                  {dateFilter === 'custom' && (
                    <div className="flex items-center gap-2 ml-4">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-300"
                      />
                      <span className="text-gray-600">to</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700">Total Revenue</p>
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% from yesterday</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-700">Total Orders</p>
                    <span className="text-2xl">🧾</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
                  <p className="text-xs text-blue-600 mt-1">Avg: ₹{avgOrderValue.toFixed(0)}/order</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-purple-700">Cash Collection</p>
                    <span className="text-2xl">💵</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">₹{totalCash.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 mt-1">{cashOrders} orders</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-orange-700">Online Collection</p>
                    <span className="text-2xl">💳</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">₹{totalOnline.toLocaleString()}</p>
                  <p className="text-xs text-orange-600 mt-1">{onlineOrders} orders</p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">AC Revenue</p>
                    <span className="text-xl">❄️</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{totalACRevenue.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Discounts Given</p>
                    <span className="text-xl">🎁</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{totalDiscount.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Split Payments</p>
                    <span className="text-xl">💰</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{splitOrders}</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <span className="text-xl">📈</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{avgOrderValue.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Payment Mode Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
                <h2 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💳</span>
                  Payment Mode Breakdown
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">💵</span>
                      <div>
                        <p className="font-bold text-green-900">Cash</p>
                        <p className="text-sm text-green-700">{cashOrders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{totalCash.toLocaleString()}</p>
                      <p className="text-xs text-green-600">{((totalCash / totalRevenue) * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">💳</span>
                      <div>
                        <p className="font-bold text-blue-900">Online (UPI/Card)</p>
                        <p className="text-sm text-blue-700">{onlineOrders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">₹{totalOnline.toLocaleString()}</p>
                      <p className="text-xs text-blue-600">{((totalOnline / totalRevenue) * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">💰</span>
                      <div>
                        <p className="font-bold text-purple-900">Split Payment</p>
                        <p className="text-sm text-purple-700">{splitOrders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{splitOrders}</p>
                      <p className="text-xs text-purple-600">{((splitOrders / totalOrders) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waiter Performance */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
                <h2 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">👨‍🍳</span>
                  Waiter Performance
                </h2>
                <div className="space-y-3">
                  {Object.entries(waiterStats).map(([waiter, stats]) => (
                    <div key={waiter} className="p-4 bg-gradient-to-r from-orange-50 to-primary-50 rounded-xl border-2 border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{waiter}</p>
                          <p className="text-sm text-gray-600">{stats.orders} orders served</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary-600">₹{stats.revenue.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Avg: ₹{(stats.revenue / stats.orders).toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-orange-500 h-2 rounded-full"
                          style={{ width: `${(stats.revenue / totalRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm mb-6">
              <h2 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🏆</span>
                Top Selling Items
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topItems.map((item, index) => (
                  <div key={item.name} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 relative overflow-hidden">
                    <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <p className="font-bold text-gray-900 mb-1">{item.name}</p>
                    <p className="text-sm text-gray-600 mb-2">{item.orders} orders</p>
                    <p className="text-lg font-bold text-primary-600">₹{item.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Sales Table */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <h2 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Detailed Sales Report
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Bill No</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Date & Time</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Table</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Customer</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">Items</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">Subtotal</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">AC</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">Discount</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">Total</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">Payment</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Waiter</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">{sale.billNo}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{sale.date}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{sale.table}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{sale.customer}</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-900">{sale.items}</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">₹{sale.subtotal}</td>
                        <td className="py-3 px-4 text-sm text-right text-blue-600">{sale.acCharge > 0 ? `₹${sale.acCharge}` : '-'}</td>
                        <td className="py-3 px-4 text-sm text-right text-green-600">{sale.discount > 0 ? `₹${sale.discount}` : '-'}</td>
                        <td className="py-3 px-4 text-sm text-right font-bold text-primary-600">₹{sale.total}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            sale.paymentMode === 'cash' ? 'bg-green-100 text-green-700' :
                            sale.paymentMode === 'online' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {sale.paymentMode === 'cash' ? '💵 Cash' :
                             sale.paymentMode === 'online' ? '💳 Online' :
                             '💰 Split'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{sale.waiter}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedReport(sale)}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold hover:bg-primary-200 transition-all"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td colSpan="5" className="py-4 px-4 text-sm font-bold text-gray-900">TOTAL</td>
                      <td className="py-4 px-4 text-sm text-right font-bold text-gray-900">
                        ₹{salesData.reduce((sum, s) => sum + s.subtotal, 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-bold text-blue-600">
                        ₹{totalACRevenue.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-bold text-green-600">
                        ₹{totalDiscount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-bold text-primary-600">
                        ₹{totalRevenue.toLocaleString()}
                      </td>
                      <td colSpan="3"></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan="9" className="py-3 px-4 text-sm font-bold text-gray-700">Cash Collection</td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">₹{totalCash.toLocaleString()}</td>
                      <td colSpan="2"></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan="9" className="py-3 px-4 text-sm font-bold text-gray-700">Online Collection</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600">₹{totalOnline.toLocaleString()}</td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Summary Notes */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6">
                <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Key Insights
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Peak hours: 12:30 PM - 3:00 PM and 7:00 PM - 10:00 PM</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Most popular payment mode: {cashOrders > onlineOrders ? 'Cash' : 'Online'} ({Math.max(cashOrders, onlineOrders)} orders)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Average order value increased by 8.3% compared to last week</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>AC room revenue contributes ₹{totalACRevenue.toLocaleString()} ({((totalACRevenue / totalRevenue) * 100).toFixed(1)}% of total)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-6">
                <h3 className="font-bold text-lg text-orange-900 mb-3 flex items-center">
                  <span className="mr-2">📈</span>
                  Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Consider promoting online payment to reduce cash handling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Top 5 items generate 60% of revenue - ensure consistent availability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Waiter {Object.entries(waiterStats).sort((a, b) => b[1].revenue - a[1].revenue)[0][0]} is performing exceptionally well</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Total discounts given: ₹{totalDiscount.toLocaleString()} - monitor discount strategy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bill Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                🧾 Bill Details
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Bill Header */}
              <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">🏨 Hotel Mayur</h3>
                <p className="text-sm text-gray-600 mt-1">Address Line 1, City, State - 123456</p>
                <p className="text-sm text-gray-600">Phone: +91 1234567890</p>
              </div>

              {/* Bill Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Bill Number</p>
                  <p className="font-bold text-gray-900">{selectedReport.billNo}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Date & Time</p>
                  <p className="font-bold text-gray-900">{selectedReport.date}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Table Number</p>
                  <p className="font-bold text-gray-900">{selectedReport.table}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Customer</p>
                  <p className="font-bold text-gray-900">{selectedReport.customer}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Served By</p>
                  <p className="font-bold text-gray-900">{selectedReport.waiter}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Total Items</p>
                  <p className="font-bold text-gray-900">{selectedReport.items} items</p>
                </div>
              </div>

              {/* Bill Breakdown */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3">Bill Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{selectedReport.subtotal}</span>
                  </div>
                  {selectedReport.acCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">AC Charges (20%)</span>
                      <span className="font-semibold text-blue-600">₹{selectedReport.acCharge}</span>
                    </div>
                  )}
                  {selectedReport.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600">-₹{selectedReport.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 pt-2 mt-2">
                    <span>Total Amount</span>
                    <span className="text-primary-600">₹{selectedReport.total}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <h4 className="font-bold text-green-900 mb-3">Payment Details</h4>
                {selectedReport.paymentMode === 'split' ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">💵 Cash Payment</span>
                      <span className="font-bold text-green-900">₹{selectedReport.cashAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">💳 Online Payment</span>
                      <span className="font-bold text-green-900">₹{selectedReport.onlineAmount}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">
                      {selectedReport.paymentMode === 'cash' ? '💵 Cash Payment' : '💳 Online Payment'}
                    </span>
                    <span className="font-bold text-green-900">₹{selectedReport.total}</span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          main, main * {
            visibility: visible;
          }
          main {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}