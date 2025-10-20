'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useOrders } from '@/context/OrdersContext'
import { useCart } from '@/context/CartContext'
import { ORDER_STATUS, STATUS_CONFIG } from '@/data/order-status'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function TrackOrderPage() {
  const router = useRouter()
  const { orders } = useOrders()
  const { tableNumber } = useCart()
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (orders.length > 0) {
      setSelectedOrder(orders[0])
    }
  }, [orders])

  // Demo: Simulate order status progression
  const handleSimulateProgress = () => {
    if (!selectedOrder) return
    
    const statusFlow = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.SERVED,
      ORDER_STATUS.COMPLETED,
    ]
    
    const currentIndex = statusFlow.indexOf(selectedOrder.status)
    if (currentIndex < statusFlow.length - 1) {
      const newStatus = statusFlow[currentIndex + 1]
      const updatedOrder = { ...selectedOrder, status: newStatus }
      setSelectedOrder(updatedOrder)
      toast.success(`Order status updated to ${STATUS_CONFIG[newStatus].label}`)
    }
  }

  const getProgressPercentage = (status) => {
    const statusFlow = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.SERVED,
      ORDER_STATUS.COMPLETED,
    ]
    const index = statusFlow.indexOf(status)
    return ((index + 1) / statusFlow.length) * 100
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-6xl">📋</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
            No Orders Yet
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            You haven&apos;t placed any orders. Start by browsing our delicious menu!
          </p>
          <Button variant="primary" onClick={() => router.push('/order/menu')}>
            Browse Menu
          </Button>
        </div>
      </div>
    )
  }

  const currentStatus = selectedOrder?.status || ORDER_STATUS.PENDING
  const statusConfig = STATUS_CONFIG[currentStatus]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto container-padding py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 flex items-center justify-center hover:border-primary-300 hover:shadow-md transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">
                  Track Your Order
                </h1>
                <p className="text-sm text-gray-600">Table #{tableNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto container-padding py-8">
        {/* Current Status Card */}
        <div className="mb-8 animate-slide-up">
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${statusConfig.gradient} opacity-10`}></div>
            
            <div className="relative p-8">
              {/* Status Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className={`relative w-24 h-24 rounded-full bg-gradient-to-r ${statusConfig.gradient} flex items-center justify-center shadow-lg animate-float`}>
                  <span className="text-5xl">{statusConfig.icon}</span>
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                </div>
              </div>

              {/* Status Text */}
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
                  {statusConfig.label}
                </h2>
                <p className="text-lg text-gray-600">
                  {statusConfig.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${statusConfig.gradient} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${getProgressPercentage(currentStatus)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Order Placed</span>
                  <span>{Math.round(getProgressPercentage(currentStatus))}%</span>
                  <span>Completed</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="font-bold text-lg text-gray-900">{selectedOrder?.orderNumber}</p>
                </div>
                <div className="text-center border-l border-r border-gray-300">
                  <p className="text-sm text-gray-600 mb-1">Table</p>
                  <p className="font-bold text-lg text-gray-900">#{selectedOrder?.tableNumber}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Est. Time</p>
                  <p className="font-bold text-lg text-primary-600">{selectedOrder?.estimatedTime} min</p>
                </div>
              </div>

              {/* Demo Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleSimulateProgress}
                  disabled={currentStatus === ORDER_STATUS.COMPLETED}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  🔧 Demo: Simulate Progress
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-7 h-7 mr-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Order Timeline
          </h3>
          
          <div className="relative">
            {Object.entries(STATUS_CONFIG).map(([status, config], index, array) => {
              const isActive = Object.keys(STATUS_CONFIG).indexOf(currentStatus) >= index
              const isCurrent = currentStatus === status
              
              return (
                <div key={status} className="relative flex items-start mb-8 last:mb-0">
                  {/* Connecting Line */}
                  {index < array.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-full transition-colors ${
                      isActive ? `bg-gradient-to-b ${config.gradient}` : 'bg-gray-200'
                    }`}></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    isActive 
                      ? `bg-gradient-to-r ${config.gradient} shadow-lg scale-110` 
                      : 'bg-gray-200'
                  }`}>
                    <span className="text-2xl">{config.icon}</span>
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="ml-6 flex-1">
                    <div className={`transition-all duration-500 ${isCurrent ? 'scale-105' : ''}`}>
                      <h4 className={`font-bold text-lg mb-1 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {config.label}
                      </h4>
                      <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                        {config.description}
                      </p>
                      {isCurrent && (
                        <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold animate-pulse">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span>Current Status</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-7 h-7 mr-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Order Items
          </h3>
          
          <div className="space-y-4">
            {selectedOrder?.items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {/* Veg Badge */}
                    <div className="absolute top-1 left-1">
                      <div className={`w-5 h-5 border-2 flex items-center justify-center bg-white/90 ${
                        item.isVeg ? 'border-green-600' : 'border-red-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          item.isVeg ? 'bg-green-600' : 'bg-red-600'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-600">Qty: <span className="font-semibold text-gray-900">{item.quantity}</span></p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    {item.customization && (
                      <div className="mt-2 flex items-start space-x-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                        <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-amber-900 italic flex-1">
                          <span className="font-semibold">Note:</span> {item.customization}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-primary-600">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-3xl shadow-xl p-8 border-2 border-primary-200">
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-7 h-7 mr-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            Bill Summary
          </h3>
          
          <div className="space-y-3 mb-4 pb-4 border-b-2 border-primary-200">
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">₹{selectedOrder?.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">GST (5%)</span>
              <span className="font-semibold">₹{selectedOrder?.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Service Charge (10%)</span>
              <span className="font-semibold">₹{selectedOrder?.serviceCharge.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-md">
            <span className="font-bold text-xl text-gray-900">Total Amount</span>
            <span className="text-4xl font-bold text-primary-600">₹{selectedOrder?.total.toFixed(2)}</span>
          </div>

          <div className="mt-6 p-4 bg-amber-100 border-2 border-amber-300 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-amber-900 mb-1">Payment Information</p>
                <p className="text-sm text-amber-800">
                  Please proceed to the counter for payment after your meal. We accept cash and all major digital payment methods.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="w-full py-4 text-lg"
            onClick={() => router.push('/order/menu')}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Order More Items</span>
            </span>
          </Button>
          <Button 
            variant="primary" 
            className="w-full py-4 text-lg"
            onClick={() => router.push('/')}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Back to Home</span>
            </span>
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
          <p className="text-gray-600 mb-3">Need help with your order?</p>
          <div className="flex items-center justify-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
              <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="font-medium text-gray-700">Call Waiter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
              <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-700">Help Center</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}