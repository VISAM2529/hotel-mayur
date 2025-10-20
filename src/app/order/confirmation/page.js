'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useOrders } from '@/context/OrdersContext'
import Button from '@/components/ui/Button'
import Image from 'next/image'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { cart, tableNumber, getCartTotal, clearCart } = useCart()
  const { addOrder } = useOrders()
  const [orderNumber, setOrderNumber] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(null)
  const orderProcessed = useRef(false) // Prevent duplicate processing

  useEffect(() => {
    // Check if we have necessary data
    if (!tableNumber || cart.length === 0) {
      router.push('/order/menu')
      return
    }

    // Prevent processing the order multiple times
    if (orderProcessed.current) return
    orderProcessed.current = true

    // Generate order details
    const orderNo = `ORD${Date.now().toString().slice(-6)}`
    const estimatedMinutes = 20 + Math.floor(Math.random() * 15)
    
    setOrderNumber(orderNo)
    setEstimatedTime(estimatedMinutes)

    const subtotal = getCartTotal()
    const gst = subtotal * 0.05
    const serviceCharge = subtotal * 0.10
    const total = subtotal + gst + serviceCharge

    // Save order to context
    const savedOrder = addOrder({
      orderNumber: orderNo,
      tableNumber,
      items: [...cart], // Create a copy of cart items
      subtotal,
      gst,
      serviceCharge,
      total,
      estimatedTime: estimatedMinutes,
      notes: localStorage.getItem('orderNotes') || '',
    })

    console.log('Order placed:', savedOrder)

    // Clear cart after 2 seconds
    const clearTimer = setTimeout(() => {
      clearCart()
      localStorage.removeItem('orderNotes')
    }, 2000)

    return () => {
      clearTimeout(clearTimer)
    }
  }, []) // Empty dependency array - run only once

  // Calculate totals safely
  const subtotal = cart.length > 0 ? getCartTotal() : 0
  const gst = subtotal * 0.05
  const serviceCharge = subtotal * 0.10
  const total = subtotal + gst + serviceCharge

  // Show loading while processing
  if (!orderNumber || !estimatedTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Processing your order...</p>
        </div>
      </div>
    )
  }

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
                <p className="font-bold text-xl text-gray-900">{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Table Number</p>
                <p className="font-bold text-xl text-gray-900">#{tableNumber}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-900">Estimated Time</p>
                <p className="text-lg font-bold text-amber-700">{estimatedTime} minutes</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {cart.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Your Order
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        {item.customization && (
                          <p className="text-xs text-gray-500 italic mt-1">Note: {item.customization}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bill Summary */}
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-6 mb-6 border border-primary-200">
            <h3 className="font-display text-lg font-bold mb-3 text-gray-900">Bill Summary</h3>
            <div className="space-y-2 mb-3 pb-3 border-b border-primary-200">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>GST (5%)</span>
                <span className="font-medium">₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Service Charge (10%)</span>
                <span className="font-medium">₹{serviceCharge.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total Amount</span>
              <span className="text-3xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
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