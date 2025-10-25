'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import CaptainNavbar from '@/components/captain/CaptainNavbar'
import TableCard from '@/components/captain/TableCard'
import toast from 'react-hot-toast'

export default function TablesManagementPage() {
  const router = useRouter()
  const { currentCaptain, isAuthenticated, loading, captainFetch } = useCaptain()
  const [dataLoading, setDataLoading] = useState(true)
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all') // all, occupied, available, reserved
  
  // Manual Order States
  const [showManualOrderModal, setShowManualOrderModal] = useState(false)
  const [selectedTableForOrder, setSelectedTableForOrder] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [submittingOrder, setSubmittingOrder] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/captain/login')
      return
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, loading, router])

  const fetchData = async () => {
    try {
      setDataLoading(true)

      // Fetch tables
      const tablesResponse = await captainFetch('/api/tables')
      const tablesData = await tablesResponse.json()

      if (tablesData.success) {
        setTables(tablesData.data.tables)
      }

      // Fetch active orders
      const ordersResponse = await captainFetch('/api/orders?kitchenStatus=true')
      const ordersData = await ordersResponse.json()

      if (ordersData.success) {
        setOrders(ordersData.data.orders)
      }

      setDataLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load tables')
      setDataLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await captainFetch('/api/menu/items')
      const data = await response.json()
      console.log('Menu items data:', data)
      
      if (data.success) {
        setMenuItems(data.data.items || [])
        
        // Extract unique categories - Handle both string and object categories
        const items = data.data.items || []
        const categoryMap = new Map()
        
        items.forEach(item => {
          if (item.category) {
            // Check if category is an object or string
            if (typeof item.category === 'object' && item.category !== null) {
              // Category is an object with _id, name, icon
              const catId = item.category._id || item.category.name
              if (catId && !categoryMap.has(catId)) {
                categoryMap.set(catId, {
                  id: catId,
                  name: item.category.name || catId,
                  icon: item.category.icon || '📁'
                })
              }
            } else if (typeof item.category === 'string') {
              // Category is a string
              if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, {
                  id: item.category,
                  name: item.category,
                  icon: '📁'
                })
              }
            }
          }
        })
        
        const uniqueCategories = Array.from(categoryMap.values())
        setCategories(uniqueCategories)
        
        console.log('Unique categories:', uniqueCategories)
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu')
    }
  }

  const handlePlaceManualOrder = async (table) => {
    setSelectedTableForOrder(table)
    setShowManualOrderModal(true)
    setSelectedItems([])
    setCustomerName('')
    setCustomerPhone('')
    setSpecialInstructions('')
    setSearchQuery('')
    setCategoryFilter('all')
    
    // Fetch menu items
    await fetchMenuItems()
  }

  const handleAddItemToOrder = (menuItem) => {
    const existingItem = selectedItems.find(item => item.menuItem._id === menuItem._id)
    
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.menuItem._id === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
      toast.success(`Added another ${menuItem.name}`)
    } else {
      setSelectedItems([...selectedItems, {
        menuItem: menuItem,
        quantity: 1,
        customizations: ''
      }])
      toast.success(`Added ${menuItem.name} to order`)
    }
  }

  const handleUpdateQuantity = (menuItemId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedItems(selectedItems.filter(item => item.menuItem._id !== menuItemId))
      toast.success('Item removed from order')
    } else {
      setSelectedItems(selectedItems.map(item =>
        item.menuItem._id === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const handleUpdateCustomizations = (menuItemId, customizations) => {
    setSelectedItems(selectedItems.map(item =>
      item.menuItem._id === menuItemId
        ? { ...item, customizations }
        : item
    ))
  }

  const handleSubmitManualOrder = async () => {
    if (!selectedTableForOrder) {
      toast.error('No table selected')
      return
    }

    if (selectedItems.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    try {
      setSubmittingOrder(true)

      const orderItems = selectedItems.map(item => ({
        menuItem: item.menuItem._id,
        quantity: item.quantity,
        customizations: item.customizations,
        price: item.menuItem.price
      }))

      const orderData = {
        tableNumber: selectedTableForOrder.tableNumber,
        tableId: selectedTableForOrder._id,
        items: orderItems,
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || 'N/A',
        specialInstructions: specialInstructions,
        orderType: 'dine-in',
        placedBy: currentCaptain?._id
      }

      const response = await captainFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Order placed for Table ${selectedTableForOrder.tableNumber}!`)
        setShowManualOrderModal(false)
        setSelectedTableForOrder(null)
        setSelectedItems([])
        await fetchData()
      } else {
        toast.error(result.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing manual order:', error)
      toast.error('Failed to place order')
    } finally {
      setSubmittingOrder(false)
    }
  }

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => 
      sum + (item.menuItem.price * item.quantity), 0
    )
  }

  // Helper function to get category ID from item
  const getCategoryId = (item) => {
    if (!item.category) return null
    if (typeof item.category === 'object') {
      return item.category._id || item.category.name
    }
    return item.category
  }

  // Helper function to get category name for display
  const getCategoryName = (item) => {
    if (!item.category) return 'Unknown'
    if (typeof item.category === 'object') {
      return item.category.name || 'Unknown'
    }
    return item.category
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    )
  }

  const filteredTables = tables.filter(table => {
    if (filter === 'occupied') return table.status === 'occupied'
    if (filter === 'available') return table.status === 'available'
    if (filter === 'reserved') return table.status === 'reserved'
    return true
  })

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const itemCategoryId = getCategoryId(item)
    const matchesCategory = categoryFilter === 'all' || itemCategoryId === categoryFilter
    const isAvailable = item.isAvailable !== false
    return matchesSearch && matchesCategory && isAvailable
  })

  const occupiedCount = tables.filter(t => t.status === 'occupied').length
  const availableCount = tables.filter(t => t.status === 'available').length
  const reservedCount = tables.filter(t => t.status === 'reserved').length

  const handleViewTableDetails = (table) => {
    const tableOrders = orders.filter(order => 
      order.tableNumber === table.tableNumber &&
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    )

    if (tableOrders.length > 0) {
      router.push(`/captain/tables/${table._id}`)
    } else {
      toast.info(`Table ${table.tableNumber} - ${table.status}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <CaptainNavbar />

      <div className="max-w-7xl mx-auto container-padding py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-primary-300 transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="font-display text-3xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">🪑</span>
                  Tables Management
                </h1>
                <p className="text-gray-600 mt-1">{tables.length} tables in restaurant</p>
              </div>
            </div>

            <button
              onClick={() => {
                const availableTables = tables.filter(t => t.status === 'available')
                if (availableTables.length > 0) {
                  handlePlaceManualOrder(availableTables[0])
                } else {
                  toast.error('No available tables')
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Place Manual Order</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Tables</p>
                <span className="text-2xl">🪑</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border-2 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">Occupied</p>
                <span className="text-2xl">🔴</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{occupiedCount}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Available</p>
                <span className="text-2xl">🟢</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{availableCount}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">Occupancy</p>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All ({tables.length})
            </button>
            <button
              onClick={() => setFilter('occupied')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'occupied'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🔴 Occupied ({occupiedCount})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'available'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🟢 Available ({availableCount})
            </button>
            <button
              onClick={() => setFilter('reserved')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                filter === 'reserved'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              📅 Reserved ({reservedCount})
            </button>
          </div>
        </div>

        {filteredTables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map((table, index) => (
              <div
                key={table._id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TableCard
                  table={table}
                  onViewDetails={handleViewTableDetails}
                  onPlaceOrder={handlePlaceManualOrder}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">🔍</span>
            </div>
            <h3 className="font-display text-3xl font-bold text-gray-900 mb-3">No Tables Found</h3>
            <p className="text-gray-600 text-lg mb-6">No tables match the selected filter</p>
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all"
            >
              View All Tables
            </button>
          </div>
        )}

        <div className="mt-12 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">🗺️</span>
            Table Layout Overview
          </h2>
          
          <div className="grid grid-cols-5 gap-4">
            {tables.slice(0, 20).map((table) => (
              <button
                key={table._id}
                onClick={() => handleViewTableDetails(table)}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all hover:scale-105 ${
                  table.status === 'occupied'
                    ? 'bg-red-100 border-red-400 hover:border-red-500'
                    : table.status === 'reserved'
                    ? 'bg-blue-100 border-blue-400 hover:border-blue-500'
                    : 'bg-green-100 border-green-400 hover:border-green-500'
                }`}
              >
                <span className="text-3xl mb-2">🪑</span>
                <p className="font-bold text-sm">{table.tableNumber}</p>
                <p className="text-xs text-gray-600">{table.capacity}👥</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Reserved</span>
            </div>
          </div>
        </div>
      </div>

      {showManualOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="mr-3">📝</span>
                    Place Manual Order
                  </h2>
                  <p className="text-orange-100 mt-1">
                    {selectedTableForOrder ? `Table ${selectedTableForOrder.tableNumber}` : 'Select Table'}
                  </p>
                </div>
                <button
                  onClick={() => setShowManualOrderModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Table</label>
                  <select
                    value={selectedTableForOrder?._id || ''}
                    onChange={(e) => {
                      const table = tables.find(t => t._id === e.target.value)
                      setSelectedTableForOrder(table)
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                  >
                    <option value="">Choose a table</option>
                    {tables
                      .filter(t => t.status === 'available' || t.status === 'occupied')
                      .map(table => (
                        <option key={table._id} value={table._id}>
                          Table {table.tableNumber} ({table.capacity} seats) - {table.status}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="relative mb-4">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search menu items..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                        categoryFilter === 'all'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setCategoryFilter(category.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                          categoryFilter === category.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category.icon} {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {filteredMenuItems.map(item => (
                    <button
                      key={item._id}
                      onClick={() => handleAddItemToOrder(item)}
                      className="text-left p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-orange-400 transition-all group"
                    >
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-orange-600 font-bold">₹{item.price}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded capitalize">
                          {getCategoryName(item)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredMenuItems?.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No menu items found</p>
                  </div>
                )}
              </div>

              <div className="w-96 bg-gray-50 p-6 flex flex-col">
                <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🛒</span>
                  Order Summary
                </h3>

                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item, index) => (
                      <div key={`order-item-${item.menuItem._id}-${index}`} className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.menuItem.name}</h4>
                            <p className="text-sm text-orange-600 font-semibold">₹{item.menuItem.price}</p>
                          </div>
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItem._id, 0)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center space-x-3 mb-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItem._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="font-bold text-gray-900 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.menuItem._id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <input
                          type="text"
                          value={item.customizations}
                          onChange={(e) => handleUpdateCustomizations(item.menuItem._id, e.target.value)}
                          placeholder="Special instructions..."
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none"
                        />

                        <div className="mt-2 text-right">
                          <span className="text-sm text-gray-600">Subtotal: </span>
                          <span className="font-bold text-gray-900">₹{item.menuItem.price * item.quantity}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p>No items added yet</p>
                      <p className="text-sm mt-1">Select items from the menu</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests for the kitchen..."
                    rows="2"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-orange-200 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium text-gray-900">{selectedItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">
                      {selectedItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-900">Total:</span>
                    <span className="font-bold text-2xl text-orange-600">₹{calculateTotal()}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitManualOrder}
                  disabled={submittingOrder || selectedItems.length === 0 || !selectedTableForOrder}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                    submittingOrder || selectedItems.length === 0 || !selectedTableForOrder
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg'
                  }`}
                >
                  {submittingOrder ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Placing Order...
                    </span>
                  ) : (
                    '🍽️ Place Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}