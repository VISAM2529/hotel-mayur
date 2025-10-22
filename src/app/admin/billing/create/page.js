'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useOrders } from '@/context/OrdersContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import toast from 'react-hot-toast'
import React from 'react'
export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table')
  const { isAuthenticated } = useAdmin()
  const { orders } = useOrders()
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [selectedTable, setSelectedTable] = useState(tableNumber || '')
  const [isAC, setIsAC] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMode, setPaymentMode] = useState('cash')
  const [splitPayment, setSplitPayment] = useState(false)
  const [cashAmount, setCashAmount] = useState('')
  const [onlineAmount, setOnlineAmount] = useState('')
  const [discount, setDiscount] = useState(0)
  const [comments, setComments] = useState('')
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [generatedBill, setGeneratedBill] = useState(null)

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/admin/login')
//       return
//     }
//     setLoading(false)
//   }, [isAuthenticated, router])

  const menuCategories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'starters', name: 'Starters', icon: '🥗' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
    { id: 'main-course', name: 'Main Course', icon: '🍛' },
    { id: 'roti', name: 'Roti & Breads', icon: '🫓' },
    { id: 'refreshments', name: 'Refreshments', icon: '🥤' }
  ]

  const menuItems = [
    { id: 1, name: 'Paneer Tikka', category: 'starters', price: 180, icon: '🧀' },
    { id: 2, name: 'Veg Spring Roll', category: 'starters', price: 120, icon: '🥟' },
    { id: 3, name: 'Butter Chicken', category: 'main-course', price: 280, icon: '🍗' },
    { id: 4, name: 'Dal Makhani', category: 'main-course', price: 200, icon: '🍲' },
    { id: 5, name: 'Palak Paneer', category: 'vegetables', price: 200, icon: '🥬' },
    { id: 6, name: 'Mix Veg', category: 'vegetables', price: 150, icon: '🥗' },
    { id: 7, name: 'Butter Naan', category: 'roti', price: 40, icon: '🫓' },
    { id: 8, name: 'Tandoori Roti', category: 'roti', price: 30, icon: '🍞' },
    { id: 9, name: 'Fresh Lime Soda', category: 'refreshments', price: 60, icon: '🍋' },
    { id: 10, name: 'Lassi', category: 'refreshments', price: 70, icon: '🥤' }
  ]

  const filteredMenu = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing system...</p>
        </div>
      </div>
    )
  }

  const addToCart = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1, comments: '' }])
    }
    toast.success(`${item.name} added to cart`)
  }

  const updateQuantity = (id, change) => {
    setCartItems(cartItems.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ).filter(item => item.quantity > 0))
  }

  const updateItemComment = (id, comment) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, comments: comment } : item
    ))
  }

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
    toast.success('Item removed from cart')
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateACCharge = () => {
    return isAC ? calculateSubtotal() * 0.20 : 0
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const acCharge = calculateACCharge()
    const discountAmount = (subtotal + acCharge) * (discount / 100)
    return subtotal + acCharge - discountAmount
  }

  const handleGenerateBill = () => {
    if (cartItems.length === 0) {
      toast.error('Please add items to cart')
      return
    }
    if (!selectedTable) {
      toast.error('Please select a table')
      return
    }

    if (splitPayment) {
      const total = calculateTotal()
      const cashAmt = parseFloat(cashAmount) || 0
      const onlineAmt = parseFloat(onlineAmount) || 0
      if (Math.abs((cashAmt + onlineAmt) - total) > 0.01) {
        toast.error(`Split payment total (₹${cashAmt + onlineAmt}) must equal bill total (₹${total.toFixed(2)})`)
        return
      }
    }

    const bill = {
      billNumber: `BILL-${Date.now()}`,
      date: new Date().toLocaleString('en-IN'),
      tableNumber: selectedTable,
      customerName: customerName || 'Guest',
      customerPhone: customerPhone || 'N/A',
      items: cartItems,
      subtotal: calculateSubtotal(),
      isAC: isAC,
      acCharge: calculateACCharge(),
      discount: discount,
      discountAmount: (calculateSubtotal() + calculateACCharge()) * (discount / 100),
      total: calculateTotal(),
      paymentMode: splitPayment ? 'split' : paymentMode,
      cashAmount: splitPayment ? parseFloat(cashAmount) : (paymentMode === 'cash' ? calculateTotal() : 0),
      onlineAmount: splitPayment ? parseFloat(onlineAmount) : (paymentMode === 'online' ? calculateTotal() : 0),
      comments: comments
    }

    setGeneratedBill(bill)
    setShowPrintPreview(true)
    toast.success('Bill generated successfully!')
  }

  const handlePrintBill = () => {
    window.print()
    toast.success('Bill printed!')
  }

  const handleSaveBill = () => {
    // Save bill to orders context or database
    toast.success('Bill saved successfully!')
    // Reset form
    setCartItems([])
    setSelectedTable('')
    setCustomerName('')
    setCustomerPhone('')
    setPaymentMode('cash')
    setSplitPayment(false)
    setCashAmount('')
    setOnlineAmount('')
    setDiscount(0)
    setComments('')
    setShowPrintPreview(false)
    setGeneratedBill(null)
    router.push('/admin/dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
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
                    <span className="mr-3">🧾</span>
                    Create Bill
                  </h1>
                  <p className="text-gray-600 mt-1">Generate bills and manage payments</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Menu Selection */}
              <div className="lg:col-span-2 space-y-4">
                {/* Table & Customer Info */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
                  <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    Order Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Table Number *</label>
                      <input
                        type="text"
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                        placeholder="Enter table no."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                        placeholder="Guest name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                        placeholder="Contact no."
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAC}
                        onChange={(e) => setIsAC(e.target.checked)}
                        className="w-5 h-5 text-primary-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ❄️ AC Room (20% extra charge)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                  {menuCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredMenu.map(item => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-primary-300 hover:shadow-lg transition-all text-left"
                    >
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <p className="font-bold text-gray-900 text-sm mb-1">{item.name}</p>
                      <p className="text-primary-600 font-bold text-lg">₹{item.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Cart & Billing */}
              <div className="space-y-4">
                {/* Cart */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm sticky top-4">
                  <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="mr-2">🛒</span>
                      Cart ({cartItems.length})
                    </span>
                    {cartItems.length > 0 && (
                      <button
                        onClick={() => {
                          setCartItems([])
                          toast.success('Cart cleared')
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    )}
                  </h2>

                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-5xl mb-3">🛒</p>
                      <p className="text-gray-500">Cart is empty</p>
                      <p className="text-sm text-gray-400 mt-1">Add items from menu</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                        {cartItems.map(item => (
                          <div key={item.id} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500">₹{item.price} each</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                              <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                            </div>

                            <input
                              type="text"
                              placeholder="Add comment (e.g., extra butter)"
                              value={item.comments}
                              onChange={(e) => updateItemComment(item.id, e.target.value)}
                              className="w-full mt-2 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-primary-300"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Bill Summary */}
                      <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {isAC && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">AC Charges (20%)</span>
                            <span className="font-semibold text-blue-600">₹{calculateACCharge().toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Discount</span>
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                            className="w-16 px-2 py-1 text-right border border-gray-200 rounded-lg focus:outline-none focus:border-primary-300"
                            placeholder="0"
                          />
                          <span className="ml-1">%</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount Amount</span>
                            <span className="font-semibold text-green-600">-₹{((calculateSubtotal() + calculateACCharge()) * (discount / 100)).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 pt-2">
                          <span>Total</span>
                          <span className="text-primary-600">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Payment Mode */}
                      <div className="border-t-2 border-gray-200 pt-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <button
                            onClick={() => {
                              setPaymentMode('cash')
                              setSplitPayment(false)
                            }}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${
                              paymentMode === 'cash' && !splitPayment
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            💵 Cash
                          </button>
                          <button
                            onClick={() => {
                              setPaymentMode('online')
                              setSplitPayment(false)
                            }}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${
                              paymentMode === 'online' && !splitPayment
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            💳 Online
                          </button>
                        </div>
                        
                        <label className="flex items-center gap-2 mb-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={splitPayment}
                            onChange={(e) => setSplitPayment(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Split Payment (Cash + Online)</span>
                        </label>

                        {splitPayment && (
                          <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">Cash Amount</label>
                              <input
                                type="number"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-400"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">Online Amount</label>
                              <input
                                type="number"
                                value={onlineAmount}
                                onChange={(e) => setOnlineAmount(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-400"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comments */}
                      <div className="border-t-2 border-gray-200 pt-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bill Comments</label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 text-sm"
                          rows="2"
                          placeholder="e.g., Total ₹310 but customer paid ₹300"
                        />
                      </div>

                      {/* Generate Bill Button */}
                      <button
                        onClick={handleGenerateBill}
                        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-bold hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg"
                      >
                        🧾 Generate Bill
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && generatedBill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowPrintPreview(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Print Area */}
            <div id="print-area" className="p-8">
              {/* Header */}
              <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">🏨 Hotel Mayur</h1>
                <p className="text-sm text-gray-600 mt-1">Address Line 1, City, State - 123456</p>
                <p className="text-sm text-gray-600">Phone: +91 1234567890 | GST: 27XXXXXXX</p>
              </div>

              {/* Bill Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-600">Bill No: <span className="font-bold text-gray-900">{generatedBill.billNumber}</span></p>
                  <p className="text-gray-600">Date: <span className="font-bold text-gray-900">{generatedBill.date}</span></p>
                  <p className="text-gray-600">Table: <span className="font-bold text-gray-900">{generatedBill.tableNumber}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Customer: <span className="font-bold text-gray-900">{generatedBill.customerName}</span></p>
                  <p className="text-gray-600">Phone: <span className="font-bold text-gray-900">{generatedBill.customerPhone}</span></p>
                  {generatedBill.isAC && <p className="text-blue-600 font-bold">❄️ AC Room</p>}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 text-sm">Item</th>
                    <th className="text-center py-2 text-sm">Qty</th>
                    <th className="text-right py-2 text-sm">Price</th>
                    <th className="text-right py-2 text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedBill.items.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-sm">{item.name}</td>
                        <td className="text-center py-2 text-sm">{item.quantity}</td>
                        <td className="text-right py-2 text-sm">₹{item.price}</td>
                        <td className="text-right py-2 text-sm font-semibold">₹{item.price * item.quantity}</td>
                      </tr>
                      {item.comments && (
                        <tr>
                          <td colSpan="4" className="text-xs text-gray-500 italic pb-2">
                            Note: {item.comments}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                    ))}
                </tbody>
              </table>

              {/* Bill Summary */}
              <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{generatedBill.subtotal.toFixed(2)}</span>
                </div>
                {generatedBill.isAC && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AC Charges (20%)</span>
                    <span className="font-semibold text-blue-600">₹{generatedBill.acCharge.toFixed(2)}</span>
                  </div>
                )}
                {generatedBill.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount ({generatedBill.discount}%)</span>
                    <span className="font-semibold text-green-600">-₹{generatedBill.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-3 mt-3">
                  <span>Grand Total</span>
                  <span className="text-primary-600">₹{generatedBill.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="font-bold text-gray-900 mb-2">Payment Details</p>
                {generatedBill.paymentMode === 'split' ? (
                  <>
                    <p className="text-sm text-gray-600">💵 Cash: ₹{generatedBill.cashAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">💳 Online: ₹{generatedBill.onlineAmount.toFixed(2)}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    {generatedBill.paymentMode === 'cash' ? '💵 Cash' : '💳 Online'}: ₹{generatedBill.total.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Comments */}
              {generatedBill.comments && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <p className="font-bold text-yellow-900 mb-1">💬 Comments</p>
                  <p className="text-sm text-yellow-800">{generatedBill.comments}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 text-center text-sm text-gray-600 border-t-2 border-gray-300 pt-4">
                <p className="font-semibold">Thank you for dining with us! 🙏</p>
                <p className="mt-1">Visit again soon!</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t-2 border-gray-200 p-6 grid grid-cols-3 gap-3">
              <button
                onClick={handlePrintBill}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleSaveBill}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-orange-600 transition-all"
              >
                💾 Save & Close
              </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                ✖️ Cancel
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
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}