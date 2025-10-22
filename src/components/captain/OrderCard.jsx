'use client'

import Image from 'next/image'
import { useState } from 'react'
import { STATUS_CONFIG } from '@/data/order-status'

export default function OrderCard({ order, onApprove, onReject, onViewDetails, showActions = true }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const statusConfig = STATUS_CONFIG[order.status]

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${statusConfig.gradient} bg-opacity-10 border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center shadow-lg`}>
              <span className="text-2xl">{statusConfig.icon}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
              <p className="text-sm text-gray-600">Table #{order.tableNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
              order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
              order.status === 'ready' ? 'bg-purple-100 text-purple-700' :
              'bg-green-100 text-green-700'
            }`}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
              <span>{statusConfig.label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(order.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Order Items ({order.items.length})</p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </button>
        </div>

        <div className={`space-y-2 ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  {item.customization && (
                    <p className="text-xs text-amber-700 italic mt-1">📝 {item.customization}</p>
                  )}
                </div>
              </div>
              <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-1">Special Instructions:</p>
            <p className="text-sm text-blue-800">{order.notes}</p>
          </div>
        )}

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600">₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && order.status === 'pending' && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onViewDetails(order)}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-all"
            >
              View Details
            </button>
            <button
              onClick={() => onReject(order)}
              className="px-4 py-2 bg-red-50 border-2 border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 transition-all"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(order)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-sm font-medium text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
            >
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  )
}