'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import toast from 'react-hot-toast'
import React from 'react'

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table')
  const tableId = searchParams.get('tableId')
  const orderIds = searchParams.get('orders')
  
  const { isAuthenticated, adminFetch, loading: authLoading } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Cart items (loaded from orders)
  const [cartItems, setCartItems] = useState([])
  const [originalOrders, setOriginalOrders] = useState([])
  
  // Billing form
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
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
      return
    }
    
    if (isAuthenticated && orderIds) {
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, authLoading, router, orderIds])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // Fetch orders by IDs
      const idsArray = orderIds.split(',')
      const ordersResponse = await adminFetch(`/api/orders?ids=${orderIds}&populate=true`)
      const ordersData = await ordersResponse.json()
      
      if (ordersData.success && ordersData.data.orders) {
        const orders = ordersData.data.orders
        setOriginalOrders(orders)
        
        // Convert orders to cart items
        const items = []
        orders.forEach(order => {
          order.items.forEach(item => {
            items.push({
              id: item._id || `${order._id}-${item.menuItem?._id}`,
              name: item.menuItem?.name || item.name,
              price: item.price,
              quantity: item.quantity,
              comments: item.comments || '',
              orderId: order._id,
              orderNumber: order.orderNumber
            })
          })
        })
        
        setCartItems(items)
        
        // Set customer info if available
        if (orders[0]?.customer) {
          setCustomerName(orders[0].customer.name || '')
          setCustomerPhone(orders[0].customer.phone || '')
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing system...</p>
        </div>
      </div>
    )
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

  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      toast.error('No items to bill')
      return
    }
    if (!selectedTable) {
      toast.error('Please enter table number')
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
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleString('en-IN'),
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

  const handleCompleteBilling = async () => {
    if (!generatedBill) return
    
    try {
      setProcessing(true)
      
      // 1. Mark all orders as completed
      const orderIdsToComplete = [...new Set(originalOrders.map(o => o._id))]
      
      const completeResponse = await adminFetch('/api/orders/bulk-complete', {
        method: 'PUT',
        body: JSON.stringify({
          orderIds: orderIdsToComplete,
          status: 'completed'
        })
      })
      
      const completeResult = await completeResponse.json()
      
      if (!completeResult.success) {
        toast.error('Failed to complete orders')
        setProcessing(false)
        return
      }
      
      // 2. Clear table session if tableId exists
      if (tableId) {
        const sessionResponse = await adminFetch(`/api/tables/${tableId}/clear-session`, {
          method: 'POST'
        })
        
        const sessionResult = await sessionResponse.json()
        
        if (!sessionResult.success) {
          console.error('Failed to clear session:', sessionResult.error)
          // Don't fail the whole process, just log
        }
      }
      
      // 3. Save bill to database (optional)
      const billResponse = await adminFetch('/api/bills', {
        method: 'POST',
        body: JSON.stringify({
          ...generatedBill,
          orders: orderIdsToComplete,
          tableId: tableId
        })
      })
      
      const billResult = await billResponse.json()
      
      setProcessing(false)
      toast.success('✅ Payment completed! Orders marked complete and table session cleared.')
      
      // Reset form and redirect
      setTimeout(() => {
        router.push('/admin/tables')
      }, 2000)
      
    } catch (error) {
      console.error('Error completing billing:', error)
      toast.error('Failed to complete billing process')
      setProcessing(false)
    }
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
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-orange-300 transition-all"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">🧾</span>
                  Create Bill - Table {tableNumber}
                </h1>
              </div>
              {orderIds && (
                <div className="ml-13 px-4 py-2 bg-blue-100 border-2 border-blue-300 rounded-xl inline-block">
                  <p className="text-sm text-blue-700 font-semibold">
                    📋 {originalOrders.length} order{originalOrders.length !== 1 ? 's' : ''} loaded from table
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    🛒 Cart Items ({cartItems.length})
                  </h2>

                  {cartItems.length > 0 ? (
                    <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                  {item.orderNumber}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">₹{item.price} each</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 bg-white border-2 border-orange-300 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors"
                              >
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 bg-white border-2 border-orange-300 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors"
                              >
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xl font-bold text-orange-600">₹{item.price * item.quantity}</p>
                          </div>

                          {item.comments && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-xs text-yellow-800">💬 {item.comments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <span className="text-6xl mb-4 block">🛒</span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Items</h3>
                      <p className="text-gray-600">Cart is empty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Details Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-gray-200 sticky top-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">💳 Billing Details</h2>

                  {cartItems.length > 0 ? (
                    <>
                      {/* Table Number */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Table Number *</label>
                        <input
                          type="text"
                          value={selectedTable}
                          onChange={(e) => setSelectedTable(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                          placeholder="e.g., 1, 2, 3..."
                          disabled={!!tableNumber}
                        />
                      </div>

                      {/* Customer Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                            placeholder="Guest"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      {/* AC Room Toggle */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAC}
                            onChange={(e) => setIsAC(e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm font-semibold text-gray-700">❄️ AC Room (+20%)</span>
                        </label>
                      </div>

                      {/* Bill Summary */}
                      <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl space-y-2">
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
                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount ({discount}%)</span>
                            <span className="font-semibold text-green-600">-₹{((calculateSubtotal() + calculateACCharge()) * (discount / 100)).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2 mt-2">
                          <span>Total</span>
                          <span className="text-orange-600">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Discount */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                        />
                      </div>

                      {/* Payment Mode */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
                        <select
                          value={splitPayment ? 'split' : paymentMode}
                          onChange={(e) => {
                            if (e.target.value === 'split') {
                              setSplitPayment(true)
                            } else {
                              setSplitPayment(false)
                              setPaymentMode(e.target.value)
                            }
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                        >
                          <option value="cash">💵 Cash</option>
                          <option value="online">💳 Online/Card</option>
                          <option value="split">🔀 Split Payment</option>
                        </select>
                      </div>

                      {/* Split Payment Inputs */}
                      {splitPayment && (
                        <div className="mb-4 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cash Amount</label>
                            <input
                              type="number"
                              value={cashAmount}
                              onChange={(e) => setCashAmount(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Online Amount</label>
                            <input
                              type="number"
                              value={onlineAmount}
                              onChange={(e) => setOnlineAmount(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}

                      {/* Comments */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Comments (Optional)</label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                          rows="2"
                          placeholder="Any notes..."
                        />
                      </div>

                      {/* Generate Bill Button */}
                      <button
                        onClick={handleGenerateBill}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                      >
                        🧾 Generate Bill
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Add items to cart to create bill</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && generatedBill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => !processing && setShowPrintPreview(false)}>
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
                  <p className="text-gray-600">Date: <span className="font-bold text-gray-900">{generatedBill.displayDate || new Date(generatedBill.date).toLocaleString('en-IN')}</span></p>
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
                  <span className="text-orange-600">₹{generatedBill.total.toFixed(2)}</span>
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
                disabled={processing}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleCompleteBilling}
                disabled={processing}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>✅ Complete Payment</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                disabled={processing}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
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