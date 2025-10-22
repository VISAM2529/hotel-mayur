'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import DishCard from '@/components/order/DishCard'
import OrderStatusTracker from '@/components/order/OrderStatusTracker'
import toast from 'react-hot-toast'

export default function MenuPage() {
  const router = useRouter()
  const { tableNumber, getCartCount, getCartTotal, isLoaded } = useCart()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOrders, setShowOrders] = useState(false)
  
  // API data states
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [customerOrders, setCustomerOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isLoaded && !tableNumber) {
      toast.error('Please scan QR code at your table first!')
      router.push('/')
    }
  }, [tableNumber, router, isLoaded])

  // Fetch categories and menu items from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories?isActive=true&includeItemCount=true&sortBy=displayOrder&sortOrder=asc')
        const categoriesResult = await categoriesResponse.json()
        
        if (categoriesResult.success) {
          const allCategories = [
            { _id: 'all', name: 'All', icon: '🍽️', displayOrder: -1 },
            ...categoriesResult.data.categories
          ]
          setCategories(allCategories)
        }
        
        // Fetch menu items
        const menuResponse = await fetch('/api/menu/items?isAvailable=true&sortBy=name&sortOrder=asc')
        const menuResult = await menuResponse.json()
        
        if (menuResult.success) {
          setMenuItems(menuResult.data.items)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load menu. Please refresh the page.')
        setLoading(false)
        toast.error('Failed to load menu')
      }
    }

    fetchData()
  }, [])

  // Fetch customer orders
  const fetchCustomerOrders = async () => {
    if (!tableNumber) return
    
    try {
      setOrdersLoading(true)
      const response = await fetch(`/api/orders?tableNumber=${tableNumber}&sortBy=createdAt&sortOrder=desc`)
      const result = await response.json()
      
      if (result.success) {
        setCustomerOrders(result.data.orders)
      }
      setOrdersLoading(false)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setOrdersLoading(false)
    }
  }

  // Fetch orders when showing orders section
  useEffect(() => {
    if (showOrders) {
      fetchCustomerOrders()
      // Auto-refresh orders every 30 seconds
      const interval = setInterval(fetchCustomerOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [showOrders, tableNumber])

  // Filter menu based on category and search
  const filteredMenu = menuItems?.filter((dish) => {
    const matchesCategory = selectedCategory === 'all' || dish.category._id === selectedCategory
    const matchesSearch = 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.tags && dish.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesCategory && matchesSearch
  })

  const handleViewCart = () => {
    router.push('/order/cart')
  }

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Menu</h3>
          <p className="text-gray-600">Preparing delicious dishes for you...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-2xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Floating Header */}
      <div className="sticky top-0 z-50">
        {/* Main Header Bar */}
        <div className="bg-white/90 backdrop-blur-2xl border-b border-gray-200/50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Left: Logo & Info */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="group w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                >
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Hotel Mayur
                    </h1>
                    <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold shadow-lg">
                      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Premium
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                      <span className="text-xs font-bold text-blue-700">Table {tableNumber}</span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-1.5 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{filteredMenu?.length} dishes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-3">
                {/* Your Orders Button */}
                <button
                  onClick={() => setShowOrders(!showOrders)}
                  className={`group relative px-4 md:px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    showOrders
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="hidden md:inline">Your Orders</span>
                    {customerOrders.length > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        showOrders ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {customerOrders.length}
                      </span>
                    )}
                  </span>
                </button>

                {/* View Cart Button */}
                {getCartCount() > 0 && (
                  <button
                    onClick={handleViewCart}
                    className="group relative px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="hidden md:inline">₹{getCartTotal()}</span>
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">{getCartCount()}</span>
                      </div>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="pb-4">
              <div className="relative max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes, cuisines, or ingredients..."
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 inset-y-0 w-8 h-8 my-auto rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
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

        {/* Category Pills */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-3 px-4 sm:px-6 lg:px-8 py-4">
                {categories.map((category) => {
                  const itemCount = category._id === 'all' 
                    ? menuItems?.length 
                    : category.itemCount || 0
                  
                  return (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category._id)}
                      className={`group relative flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                        selectedCategory === category._id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <span className="text-lg">{category.icon || '🍽️'}</span>
                      <span>{category.name}</span>
                      {itemCount > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          selectedCategory === category._id
                            ? 'bg-white/20'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {itemCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your Orders Section */}
        {showOrders && (
          <div className="mb-8 animate-slide-down">
            <OrderStatusTracker 
              orders={customerOrders}
              loading={ordersLoading}
              onRefresh={fetchCustomerOrders}
              tableNumber={tableNumber}
            />
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {filteredMenu?.length} {filteredMenu?.length === 1 ? 'Dish' : 'Dishes'} Available
              </p>
              <p className="text-xs text-gray-600">
                {selectedCategory !== 'all' && `in ${categories.find(c => c._id === selectedCategory)?.name}`}
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
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
          
        {/* Menu Grid */}
        {filteredMenu?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenu?.map((dish, index) => (
              <div
                key={dish._id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DishCard dish={dish} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl">
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse"></div>
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
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
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

      {/* Floating Cart Button (Mobile) */}
      {getCartCount() > 0 && (
        <button
          onClick={handleViewCart}
          className="fixed bottom-6 right-6 z-50 lg:hidden group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-2xl opacity-60 group-hover:opacity-80 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
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