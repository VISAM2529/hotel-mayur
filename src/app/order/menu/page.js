'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { menuCategories } from '@/data/menu-categories'
import { fullMenu } from '@/data/full-menu'
import DishCard from '@/components/order/DishCard'
import toast from 'react-hot-toast'

export default function MenuPage() {
  const router = useRouter()
  const { tableNumber, getCartCount, getCartTotal, isLoaded } = useCart()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid or list

  useEffect(() => {
    if (isLoaded && !tableNumber) {
      toast.error('Please scan QR code at your table first!')
      router.push('/')
    }
  }, [tableNumber, router, isLoaded])

  const filteredMenu = fullMenu.filter((dish) => {
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dish.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleViewCart = () => {
    router.push('/order/cart')
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading delicious menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Floating Header with Glassmorphism */}
      <div className="sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto container-padding">
            {/* Header Content */}
            <div className="flex items-center justify-between py-4">
              {/* Left Side - Back & Info */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="group relative w-11 h-11 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 flex items-center justify-center hover:border-primary-300 hover:shadow-md transition-all duration-300"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div>
                  <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Hotel Mayur Menu
                  </h1>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary-50 to-orange-50 border border-primary-200">
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-primary-700">Table {tableNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span>{filteredMenu.length} dishes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - View Cart Button */}
              {getCartCount() > 0 && (
                <button
                  onClick={handleViewCart}
                  className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="relative">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
                        {getCartCount()}
                      </div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs leading-tight opacity-90">View Cart</p>
                      <p className="text-sm font-bold leading-tight">₹{getCartTotal().toFixed(0)}</p>
                    </div>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )}
            </div>

            {/* Search Bar - Modern Design */}
            <div className="pb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-orange-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for your favorite dish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:text-gray-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills - Horizontal Scroll */}
        <div className="bg-white/60 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-3 container-padding py-4 min-w-max">
                {menuCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2.5 ${
                      selectedCategory === category.id
                        ? 'bg-orange-500 text-white shadow-lg shadow-primary-200 scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-300 hover:shadow-md'
                    }`}
                  >
                    {selectedCategory === category.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    <span className="relative text-xl">{category.icon}</span>
                    <span className="relative font-semibold">{category.name}</span>
                    {selectedCategory === category.id && (
                      <div className="relative w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Results Info Bar */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {filteredMenu.length} {filteredMenu.length === 1 ? 'Dish' : 'Dishes'} Available
              </p>
              <p className="text-xs text-gray-600">
                {selectedCategory !== 'all' && `in ${menuCategories.find(c => c.id === selectedCategory)?.name}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </div>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Menu Grid */}
        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenu.map((dish, index) => (
              <div
                key={dish.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DishCard dish={dish} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-orange-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl">🔍</span>
              </div>
            </div>
            <h3 className="font-display text-3xl font-bold text-gray-900 mb-3">
              No dishes found
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              We couldn&apos;t find any dishes matching your search. Try different keywords or browse all categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Browse All Dishes</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile) */}
      {getCartCount() > 0 && (
        <button
          onClick={handleViewCart}
          className="fixed bottom-6 right-6 z-50 lg:hidden group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-orange-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-primary-500 to-orange-500 rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce">
                {getCartCount()}
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  )
}