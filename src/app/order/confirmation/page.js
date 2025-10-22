'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'
import Image from 'next/image'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get order from localStorage (saved after API call)
    const savedOrder = localStorage.getItem('currentOrder')
    
    if (!savedOrder) {
      // No order found, redirect to menu
      router.push('/order/menu')
      return
    }

    try {
      const orderData = JSON.parse(savedOrder)
      setOrder(orderData)
      setLoading(false)

      // Clear cart after showing confirmation
      setTimeout(() => {
        clearCart()
        localStorage.removeItem('orderNotes')
        // Keep currentOrder for tracking page
      }, 1000)
    } catch (error) {
      console.error('Error loading order:', error)
      router.push('/order/menu')
    }
  }, [router, clearCart])

  // Show loading while processing
  if (loading || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Calculate estimated time (20-35 minutes based on items count)
  const estimatedMinutes = 20 + Math.min(order.items.length * 2, 15)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-float shadow-lg">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-green-100 text-lg">
              Your KOT has been sent to the kitchen
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Order Details */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="font-bold text-xl text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Table Number</p>
                <p className="font-bold text-xl text-gray-900">#{order.tableNumber}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Status</p>
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-xl p-4 flex items-center space-x-3 mt-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-900">Estimated Time</p>
                <p className="text-lg font-bold text-amber-700">{estimatedMinutes} minutes</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Your Order ({order.items.length} items)
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {order.items.map((item, index) => (
                <div key={`${item.menuItem}-${index}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.specialInstructions && (
                        <p className="text-xs text-orange-600 italic mt-1 bg-orange-50 px-2 py-1 rounded inline-block">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">₹{item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-yellow-900 mb-1">Order Notes:</p>
              <p className="text-sm text-yellow-800">{order.notes}</p>
            </div>
          )}

          {/* Bill Summary */}
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-6 mb-6 border border-primary-200">
            <h3 className="font-display text-lg font-bold mb-3 text-gray-900">Bill Summary</h3>
            <div className="space-y-2 mb-3 pb-3 border-b border-primary-200">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>GST ({order.taxPercent}%)</span>
                <span className="font-medium">₹{order.tax.toFixed(2)}</span>
              </div>
              {order.serviceCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Service Charge ({order.serviceChargePercent}%)</span>
                  <span className="font-medium">₹{order.serviceCharge.toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total Amount</span>
              <span className="text-3xl font-bold text-primary-600">₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center text-lg">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              What&apos;s Next?
            </h4>
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start">
                <span className="mr-2 text-green-600 font-bold">✓</span>
                <span>Your order is being prepared by our chef</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600 font-bold">✓</span>
                <span>Track your order status in &apos;My Orders&apos; section</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600 font-bold">✓</span>
                <span>Pay at the counter after your meal</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/order/menu')}
            >
              Order More
            </Button>
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => router.push('/order/track')}
            >
              Track Order
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => router.push('/')}
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}