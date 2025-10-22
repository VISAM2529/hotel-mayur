'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import CartItem from '@/components/order/CartItem'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const router = useRouter()
  const { cart, tableNumber, getCartTotal, getCartCount, clearCart, isLoaded } = useCart()
  const [orderNotes, setOrderNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Only check after cart context is loaded
    if (isLoaded) {
      if (!tableNumber) {
        alert('Please scan the QR code at your table first!')
        router.push('/')
      }
    }
  }, [tableNumber, router, isLoaded])

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }
    console.log('Placing order for table:', cart)
    setIsSubmitting(true)

    try {
      // Prepare order data for API
      const orderData = {
        tableNumber: parseInt(tableNumber),
        orderType: 'dine-in',
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          specialInstructions: item.customization || ''
        })),
        taxPercent: 5,
        serviceChargePercent: 10,
        notes: orderNotes,
        customer: {
          name: 'Guest', // Can be updated if you collect customer info
          phone: '', // Optional
        }
      }

      // Call API to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        // Save order details for confirmation page
        localStorage.setItem('currentOrder', JSON.stringify(result.data.order))
        localStorage.setItem('orderNotes', orderNotes)
        
        // Navigate to confirmation
        router.push('/order/confirmation')
      } else {
        alert(result.error || 'Failed to place order. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  const subtotal = getCartTotal()
  const gst = subtotal * 0.05 // 5% GST
  const serviceCharge = subtotal * 0.10 // 10% service charge
  const total = subtotal + gst + serviceCharge

  // Show loading while cart is being loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto container-padding py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="font-display text-xl font-bold">Your Cart</h1>
                <p className="text-sm text-gray-600">Table #{tableNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">🛒</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some delicious items to get started!
            </p>
            <Button variant="primary" onClick={() => router.push('/order/menu')}>
              Browse Menu
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto container-padding py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="font-display text-xl font-bold">Your Cart</h1>
                <p className="text-sm text-gray-600">Table #{tableNumber} • {getCartCount()} items</p>
              </div>
            </div>

            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
              disabled={isSubmitting}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto container-padding py-6">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cart.map((item, index) => (
            <CartItem key={`${item.id}-${item.customization}-${index}`} item={item} />
          ))}
        </div>

        {/* Order Notes */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Additional Notes (Optional)
          </h3>
          <textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Any special instructions for your order?"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
            rows="3"
            disabled={isSubmitting}
          />
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-display text-xl font-bold mb-4">Bill Summary</h3>
          
          <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({getCartCount()} items)</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (5%)</span>
              <span className="font-medium">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service Charge (10%)</span>
              <span className="font-medium">₹{serviceCharge.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-primary-500">₹{total.toFixed(2)}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Payment at Counter</p>
                <p className="text-xs text-amber-700 mt-1">
                  Please proceed to the counter for payment after your meal
                </p>
              </div>
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full py-4 text-lg"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Placing Order...
              </span>
            ) : (
              'Place Order'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}