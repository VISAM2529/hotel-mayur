'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import toast from 'react-hot-toast'

export default function InventoryManagementPage() {
  const router = useRouter()
  const { isAuthenticated } = useAdmin()
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSupplyModal, setShowSupplyModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewType, setViewType] = useState('main') // 'main' or 'counter'

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/admin/login')
//       return
//     }
//     setLoading(false)
//   }, [isAuthenticated, router])

  const categories = [
    { id: 'all', name: 'All Items', icon: '📦', count: 28 },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬', count: 8 },
    { id: 'liquid', name: 'Liquids', icon: '💧', count: 6 },
    { id: 'roti', name: 'Roti Items', icon: '🫓', count: 4 },
    { id: 'refreshments', name: 'Refreshments', icon: '🥤', count: 5 },
    { id: 'starters', name: 'Starters', icon: '🥗', count: 5 }
  ]

  const [inventoryItems, setInventoryItems] = useState([
    // Main Stock Items
    { id: 1, name: 'Tomatoes', category: 'vegetables', type: 'main', quantity: 50, unit: 'kg', minStock: 20, price: 40, supplier: 'Fresh Farms', lastUpdated: '2025-10-20', icon: '🍅' },
    { id: 2, name: 'Onions', category: 'vegetables', type: 'main', quantity: 45, unit: 'kg', minStock: 25, price: 30, supplier: 'Fresh Farms', lastUpdated: '2025-10-20', icon: '🧅' },
    { id: 3, name: 'Potatoes', category: 'vegetables', type: 'main', quantity: 60, unit: 'kg', minStock: 30, price: 25, supplier: 'Fresh Farms', lastUpdated: '2025-10-19', icon: '🥔' },
    { id: 4, name: 'Paneer', category: 'vegetables', type: 'main', quantity: 15, unit: 'kg', minStock: 10, price: 350, supplier: 'Dairy Fresh', lastUpdated: '2025-10-21', icon: '🧀' },
    { id: 5, name: 'Spinach', category: 'vegetables', type: 'main', quantity: 8, unit: 'kg', minStock: 5, price: 40, supplier: 'Fresh Farms', lastUpdated: '2025-10-20', icon: '🥬' },
    { id: 6, name: 'Cooking Oil', category: 'liquid', type: 'main', quantity: 25, unit: 'liters', minStock: 15, price: 150, supplier: 'Oil Traders', lastUpdated: '2025-10-18', icon: '🛢️' },
    { id: 7, name: 'Milk', category: 'liquid', type: 'main', quantity: 30, unit: 'liters', minStock: 20, price: 55, supplier: 'Dairy Fresh', lastUpdated: '2025-10-21', icon: '🥛' },
    { id: 8, name: 'Flour (Atta)', category: 'roti', type: 'main', quantity: 100, unit: 'kg', minStock: 50, price: 35, supplier: 'Grain Suppliers', lastUpdated: '2025-10-19', icon: '🌾' },
    { id: 9, name: 'Butter', category: 'roti', type: 'main', quantity: 12, unit: 'kg', minStock: 8, price: 450, supplier: 'Dairy Fresh', lastUpdated: '2025-10-20', icon: '🧈' },
    { id: 10, name: 'Rice', category: 'starters', type: 'main', quantity: 80, unit: 'kg', minStock: 40, price: 60, supplier: 'Grain Suppliers', lastUpdated: '2025-10-18', icon: '🍚' },
    
    // Counter Stock Items
    { id: 11, name: 'Water Bottles (1L)', category: 'liquid', type: 'counter', quantity: 150, unit: 'bottles', minStock: 50, price: 20, supplier: 'Beverage Co', lastUpdated: '2025-10-21', icon: '💧' },
    { id: 12, name: 'Water Bottles (500ml)', category: 'liquid', type: 'counter', quantity: 200, unit: 'bottles', minStock: 80, price: 15, supplier: 'Beverage Co', lastUpdated: '2025-10-21', icon: '💧' },
    { id: 13, name: 'Soft Drinks', category: 'refreshments', type: 'counter', quantity: 120, unit: 'bottles', minStock: 60, price: 40, supplier: 'Beverage Co', lastUpdated: '2025-10-20', icon: '🥤' },
    { id: 14, name: 'Juice Packets', category: 'refreshments', type: 'counter', quantity: 80, unit: 'packets', minStock: 40, price: 30, supplier: 'Beverage Co', lastUpdated: '2025-10-20', icon: '🧃' },
    { id: 15, name: 'Ice Cream Cups', category: 'refreshments', type: 'counter', quantity: 50, unit: 'cups', minStock: 30, price: 60, supplier: 'Frozen Foods', lastUpdated: '2025-10-19', icon: '🍨' },
    { id: 16, name: 'Tissue Papers', category: 'refreshments', type: 'counter', quantity: 100, unit: 'packs', minStock: 40, price: 50, supplier: 'General Store', lastUpdated: '2025-10-18', icon: '📄' },
    { id: 17, name: 'Disposable Plates', category: 'starters', type: 'counter', quantity: 200, unit: 'pieces', minStock: 100, price: 5, supplier: 'General Store', lastUpdated: '2025-10-17', icon: '🍽️' },
    { id: 18, name: 'Plastic Spoons', category: 'starters', type: 'counter', quantity: 300, unit: 'pieces', minStock: 150, price: 2, supplier: 'General Store', lastUpdated: '2025-10-17', icon: '🥄' }
  ])

  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    type: 'main',
    quantity: '',
    unit: 'kg',
    minStock: '',
    price: '',
    supplier: '',
    icon: '📦'
  })

  const [supplyData, setSupplyData] = useState({
    quantity: '',
    price: '',
    supplier: '',
    notes: ''
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filter === 'all' || item.category === filter
    const matchesType = item.type === viewType
    return matchesSearch && matchesCategory && matchesType
  })

  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minStock)
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const mainStockCount = inventoryItems.filter(item => item.type === 'main').length
  const counterStockCount = inventoryItems.filter(item => item.type === 'counter').length

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingItem) {
      setInventoryItems(inventoryItems.map(item => 
        item.id === editingItem.id 
          ? { ...formData, id: item.id, lastUpdated: new Date().toISOString().split('T')[0] } 
          : item
      ))
      toast.success('Item updated successfully!')
    } else {
      const newItem = {
        ...formData,
        id: Date.now(),
        quantity: parseFloat(formData.quantity),
        minStock: parseFloat(formData.minStock),
        price: parseFloat(formData.price),
        lastUpdated: new Date().toISOString().split('T')[0]
      }
      setInventoryItems([...inventoryItems, newItem])
      toast.success('Item added successfully!')
    }
    resetForm()
  }

  const handleAddSupply = (e) => {
    e.preventDefault()
    if (!selectedItem) return

    const updatedItem = {
      ...selectedItem,
      quantity: selectedItem.quantity + parseFloat(supplyData.quantity),
      price: parseFloat(supplyData.price) || selectedItem.price,
      supplier: supplyData.supplier || selectedItem.supplier,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    setInventoryItems(inventoryItems.map(item =>
      item.id === selectedItem.id ? updatedItem : item
    ))

    toast.success(`Added ${supplyData.quantity} ${selectedItem.unit} of ${selectedItem.name}`)
    setShowSupplyModal(false)
    setSelectedItem(null)
    setSupplyData({ quantity: '', price: '', supplier: '', notes: '' })
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowAddModal(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventoryItems(inventoryItems.filter(item => item.id !== id))
      toast.success('Item deleted successfully!')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'vegetables',
      type: 'main',
      quantity: '',
      unit: 'kg',
      minStock: '',
      price: '',
      supplier: '',
      icon: '📦'
    })
    setEditingItem(null)
    setShowAddModal(false)
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
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
                      <span className="mr-3">📦</span>
                      Inventory Management
                    </h1>
                    <p className="text-gray-600 mt-1">{inventoryItems.length} items • {lowStockItems.length} low stock alerts</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add New Item</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <span className="text-2xl">📦</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{inventoryItems.length}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-700">Main Stock</p>
                    <span className="text-2xl">🏪</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{mainStockCount}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-purple-700">Counter Stock</p>
                    <span className="text-2xl">🛒</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{counterStockCount}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border-2 border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700">Low Stock</p>
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
                </div>
              </div>

              {/* Low Stock Alert */}
              {lowStockItems.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 rounded-2xl border-2 border-red-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <p className="font-bold text-red-900">Low Stock Alert!</p>
                      <p className="text-sm text-red-700">
                        {lowStockItems.length} items need restocking: {lowStockItems.slice(0, 3).map(item => item.name).join(', ')}
                        {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* View Type Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setViewType('main')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      viewType === 'main'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    🏪 Main Stock ({mainStockCount})
                  </button>
                  <button
                    onClick={() => setViewType('counter')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      viewType === 'counter'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    🛒 Counter Stock ({counterStockCount})
                  </button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
                  <p className="text-xs text-green-700 font-medium">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalValue.toLocaleString()}</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search inventory items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-medium transition-all ${
                      filter === cat.id
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {cat.icon} {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {filteredItems.map((item) => {
                const isLowStock = item.quantity <= item.minStock
                const stockPercentage = (item.quantity / item.minStock) * 100

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer ${
                      isLowStock ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="relative bg-gradient-to-br from-orange-50 to-primary-50 p-6">
                      <div className="text-5xl text-center mb-2">{item.icon}</div>
                      {isLowStock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                          ⚠️ LOW
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 capitalize mb-3">{item.category} • {item.type} stock</p>
                      
                      {/* Stock Level Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Stock Level</span>
                          <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isLowStock ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Min: {item.minStock} {item.unit}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Price/{item.unit}</p>
                          <p className="font-bold text-gray-900">₹{item.price}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Value</p>
                          <p className="font-bold text-primary-600">₹{(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-3">
                        Supplier: <span className="font-semibold">{item.supplier}</span>
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                      </p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedItem(item)
                            setShowSupplyModal(true)
                          }}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm hover:bg-green-200 transition-all"
                        >
                          ➕ Add Supply
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(item)
                          }}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id)
                          }}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={resetForm}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                {editingItem ? '✏️ Edit Item' : '➕ Add New Item'}
              </h2>
              <button
                onClick={resetForm}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="liquid">Liquids</option>
                    <option value="roti">Roti Items</option>
                    <option value="refreshments">Refreshments</option>
                    <option value="starters">Starters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  >
                    <option value="main">Main Stock</option>
                    <option value="counter">Counter Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon/Emoji</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="📦"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="pieces">pieces</option>
                    <option value="bottles">bottles</option>
                    <option value="packets">packets</option>
                    <option value="cups">cups</option>
                    <option value="packs">packs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock Level *</label>
                  <input
                    type="number"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Unit (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg"
                >
                  {editingItem ? '✅ Update Item' : '➕ Add Item'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supply Modal */}
      {showSupplyModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => {
          setShowSupplyModal(false)
          setSelectedItem(null)
          setSupplyData({ quantity: '', price: '', supplier: '', notes: '' })
        }}>
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">{selectedItem.icon}</span>
                Add Supply
              </h2>
              <button
                onClick={() => {
                  setShowSupplyModal(false)
                  setSelectedItem(null)
                  setSupplyData({ quantity: '', price: '', supplier: '', notes: '' })
                }}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSupply} className="p-6 space-y-4">
              {/* Current Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Current Details</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Item</p>
                    <p className="font-bold text-gray-900">{selectedItem.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current Stock</p>
                    <p className="font-bold text-gray-900">{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current Price</p>
                    <p className="font-bold text-gray-900">₹{selectedItem.price}/{selectedItem.unit}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add ({selectedItem.unit}) *
                </label>
                <input
                  type="number"
                  required
                  value={supplyData.quantity}
                  onChange={(e) => setSupplyData({...supplyData, quantity: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  placeholder="Enter quantity"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Price per Unit (₹) <span className="text-gray-500 text-xs">(optional - leave blank to keep current)</span>
                </label>
                <input
                  type="number"
                  value={supplyData.price}
                  onChange={(e) => setSupplyData({...supplyData, price: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  placeholder={`Current: ₹${selectedItem.price}`}
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={supplyData.supplier}
                  onChange={(e) => setSupplyData({...supplyData, supplier: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  placeholder={selectedItem.supplier || "Supplier name"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <textarea
                  value={supplyData.notes}
                  onChange={(e) => setSupplyData({...supplyData, notes: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  rows="2"
                  placeholder="Any additional notes about this supply"
                />
              </div>

              {/* Preview */}
              {supplyData.quantity && (
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm font-medium text-green-700 mb-2">📊 Preview</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-green-600">New Stock Level</p>
                      <p className="font-bold text-green-900">
                        {(parseFloat(selectedItem.quantity) + parseFloat(supplyData.quantity)).toFixed(2)} {selectedItem.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600">Added Value</p>
                      <p className="font-bold text-green-900">
                        ₹{((parseFloat(supplyData.quantity) * (parseFloat(supplyData.price) || selectedItem.price))).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  ✅ Add Supply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSupplyModal(false)
                    setSelectedItem(null)
                    setSupplyData({ quantity: '', price: '', supplier: '', notes: '' })
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && !showSupplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-4xl">{selectedItem.icon}</span>
                {selectedItem.name}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Item Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{selectedItem.quantity} {selectedItem.unit}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Min Stock Level</p>
                <p className="text-2xl font-bold text-gray-900">{selectedItem.minStock} {selectedItem.unit}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Price per {selectedItem.unit}</p>
                <p className="text-2xl font-bold text-primary-600">₹{selectedItem.price}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₹{(selectedItem.quantity * selectedItem.price).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{selectedItem.category}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Stock Type</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{selectedItem.type} Stock</p>
              </div>
            </div>

            {/* Stock Status */}
            <div className={`mb-6 p-4 rounded-xl border-2 ${
              selectedItem.quantity <= selectedItem.minStock 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={`font-bold mb-2 ${
                selectedItem.quantity <= selectedItem.minStock ? 'text-red-900' : 'text-green-900'
              }`}>
                {selectedItem.quantity <= selectedItem.minStock ? '⚠️ Low Stock Alert' : '✅ Stock Level Good'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    selectedItem.quantity <= selectedItem.minStock ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((selectedItem.quantity / selectedItem.minStock) * 100, 100)}%` }}
                ></div>
              </div>
              <p className={`text-sm ${
                selectedItem.quantity <= selectedItem.minStock ? 'text-red-700' : 'text-green-700'
              }`}>
                {selectedItem.quantity <= selectedItem.minStock 
                  ? `Only ${selectedItem.quantity} ${selectedItem.unit} remaining. Restock needed!`
                  : `${((selectedItem.quantity / selectedItem.minStock) * 100).toFixed(0)}% above minimum stock level`
                }
              </p>
            </div>

            {/* Supplier Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Supplier</p>
              <p className="font-bold text-blue-900">{selectedItem.supplier || 'Not specified'}</p>
              <p className="text-xs text-blue-600 mt-2">
                Last Updated: {new Date(selectedItem.lastUpdated).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setSelectedItem(selectedItem)
                  setShowSupplyModal(true)
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                ➕ Add Supply
              </button>
              <button
                onClick={() => {
                  handleEdit(selectedItem)
                  setSelectedItem(null)
                }}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Close
              </button>
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