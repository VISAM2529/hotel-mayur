'use client'

import { useState } from 'react'
import Image from 'next/image'
import Card from '@/components/ui/Card'
import { useCart } from '@/context/CartContext'
import toast from 'react-hot-toast'

export default function DishCard({ dish }) {
  const [showCustomization, setShowCustomization] = useState(false)
  const [customization, setCustomization] = useState('')
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (showCustomization) {
      addToCart(dish, customization)
      setCustomization('')
      setShowCustomization(false)
      toast.success(`${dish.name} added to cart!`, {
        icon: '🛒',
      })
    } else {
      setShowCustomization(true)
    }
  }

  const handleQuickAdd = () => {
    addToCart(dish, '')
    toast.success(`${dish.name} added to cart!`, {
      icon: '✨',
    })
  }

  const getSpiceLevelColor = (level) => {
    switch (level) {
      case 'mild': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hot': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <>
      <Card className="group h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Veg/Non-veg Badge */}
          <div className="absolute top-3 left-3">
            <div className={`w-6 h-6 border-2 flex items-center justify-center bg-white/90 backdrop-blur-sm ${
              dish.isVeg ? 'border-green-600' : 'border-red-600'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                dish.isVeg ? 'bg-green-600' : 'bg-red-600'
              }`}></div>
            </div>
          </div>
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md flex items-center space-x-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm font-semibold">{dish.rating}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary-500 transition-colors">
            {dish.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
            {dish.description}
          </p>

          {/* Details */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{dish.preparationTime}</span>
            </span>
            {dish.spiceLevel !== 'none' && (
              <span className={`flex items-center space-x-1 ${getSpiceLevelColor(dish.spiceLevel)}`}>
                <span>🌶️</span>
                <span className="capitalize">{dish.spiceLevel}</span>
              </span>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-500">
              ₹{dish.price}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleQuickAdd}
                className="w-9 h-9 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors shadow-sm"
                title="Quick Add"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
              >
                Customize
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold">Customize Your Order</h3>
              <button
                onClick={() => setShowCustomization(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-gray-900 mb-2">{dish.name}</p>
              <p className="text-sm text-gray-600">{dish.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={customization}
                onChange={(e) => setCustomization(e.target.value)}
                placeholder="E.g., Extra spicy, Less oil, No onions..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                rows="3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Let us know your preferences
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCustomization(false)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}