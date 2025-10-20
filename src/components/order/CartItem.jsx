'use client'

import Image from 'next/image'
import { useCart } from '@/context/CartContext'

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  const handleIncrease = () => {
    updateQuantity(item.id, item.customization, item.quantity + 1)
  }

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.customization, item.quantity - 1)
    } else {
      removeFromCart(item.id, item.customization)
    }
  }

  const handleRemove = () => {
    if (confirm(`Remove ${item.name} from cart?`)) {
      removeFromCart(item.id, item.customization)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex space-x-4 hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
        {/* Veg/Non-veg Badge */}
        <div className="absolute top-2 left-2">
          <div className={`w-5 h-5 border-2 flex items-center justify-center bg-white ${
            item.isVeg ? 'border-green-600' : 'border-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              item.isVeg ? 'bg-green-600' : 'bg-red-600'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            {item.customization && (
              <p className="text-xs text-gray-500 mt-1">
                <span className="font-medium">Note:</span> {item.customization}
              </p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors ml-2"
            title="Remove item"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-auto">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
            <button
              onClick={handleIncrease}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-lg font-bold text-primary-500">₹{item.price * item.quantity}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-gray-500">₹{item.price} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}