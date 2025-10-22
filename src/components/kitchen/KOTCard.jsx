'use client'

import { useState, useEffect } from 'react'

export default function KOTCard({ order, onStatusChange, onPrint }) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [kotStatus, setKotStatus] = useState(order.kotStatus || 'new')

  useEffect(() => {
    // Calculate elapsed time since order was confirmed
    const orderTime = new Date(order.confirmedAt || order.createdAt).getTime()
    const updateTimer = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - orderTime) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(updateTimer)
  }, [order])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const getUrgencyColor = () => {
    if (elapsedTime > 600) return 'red' // > 10 minutes
    if (elapsedTime > 300) return 'yellow' // > 5 minutes
    return 'green'
  }

  const getUrgencyBg = () => {
    if (elapsedTime > 600) return 'bg-red-50 border-red-300'
    if (elapsedTime > 300) return 'bg-yellow-50 border-yellow-300'
    return 'bg-green-50 border-green-300'
  }

  const getStatusBadge = () => {
    const badges = {
      new: { text: 'New Order', color: 'bg-blue-500', icon: '🆕' },
      cooking: { text: 'Cooking', color: 'bg-yellow-500', icon: '👨‍🍳' },
      ready: { text: 'Ready', color: 'bg-green-500', icon: '✅' }
    }
    return badges[kotStatus] || badges.new
  }

  const handleStatusChange = (newStatus) => {
    setKotStatus(newStatus)
    onStatusChange(order.id, newStatus)
  }

  const badge = getStatusBadge()
  const urgencyColor = getUrgencyColor()

  return (
    <div className={`rounded-xl border shadow-md transition-all hover:shadow-lg bg-white ${getUrgencyBg()}`}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">KOT #{order.orderNumber}</p>
              <p className="text-xl font-bold text-gray-900">Table #{order.tableNumber}</p>
            </div>
          </div>
          
          <button
            onClick={() => onPrint(order)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print</span>
          </button>
        </div>

        {/* Timer & Status */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono font-semibold ${
            urgencyColor === 'red' ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse' :
            urgencyColor === 'yellow' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
            'bg-green-100 text-green-700 border border-green-300'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(elapsedTime)}</span>
            {urgencyColor === 'red' && (
              <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>

          <div className={`${badge.color} px-3 py-1.5 rounded-lg flex items-center space-x-2 border ${
            kotStatus === 'new' ? 'border-blue-300' :
            kotStatus === 'cooking' ? 'border-yellow-300' :
            'border-green-300'
          }`}>
            <span className="text-lg">{badge.icon}</span>
            <span className="font-semibold text-sm">{badge.text}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center text-sm">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Order Items ({order.items.length})
        </h3>
        <div className="space-y-2 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-sm font-bold mr-2">
                      {item.quantity}x
                    </span>
                    {item.name}
                  </p>
                  {item.specialInstructions && (
                    <p className="text-sm text-orange-600 mt-1.5 flex items-center bg-orange-50 px-2 py-1 rounded border border-orange-200">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium">{item.specialInstructions}</span>
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded font-medium ml-2 whitespace-nowrap">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Supplementary KOT Indicator */}
        {order.isSupplementary && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-purple-800 font-semibold flex items-center text-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Supplementary KOT - Add to existing order
            </p>
          </div>
        )}

        {/* Special Instructions */}
        {order.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 font-semibold flex items-center text-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Notes: {order.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {kotStatus === 'new' && (
            <button
              onClick={() => handleStatusChange('cooking')}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Start Cooking</span>
            </button>
          )}
          
          {kotStatus === 'cooking' && (
            <button
              onClick={() => handleStatusChange('ready')}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Mark as Ready</span>
            </button>
          )}
          
          {kotStatus === 'ready' && (
            <div className="flex-1 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-bold text-center border border-blue-200">
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Waiting for Pickup</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}