'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import toast from 'react-hot-toast'

export default function InventoryManagementPage() {
  const router = useRouter()
  const { isAuthenticated, adminFetch, loading: authLoading } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSupplyModal, setShowSupplyModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewType, setViewType] = useState('main') // 'main' or 'counter'
  const [inventoryItems, setInventoryItems] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: 'main',
    quantity: '',
    unit: 'kg',
    minStock: '',
    price: '',
    supplier: '',
    description: ''
  })

  const [supplyData, setSupplyData] = useState({
    quantity: '',
    price: '',
    supplier: '',
    notes: ''
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
      return
    }
    
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch inventory items
      const itemsResponse = await adminFetch('/api/inventory')
      const itemsData = await itemsResponse.json()
      
      if (itemsData.success) {
        setInventoryItems(itemsData.data.items)
      }
      
      // Fetch categories for filter
      const categoriesResponse = await adminFetch('/api/inventory/categories')
      const categoriesData = await categoriesResponse.json()
      
      if (categoriesData.success) {
        setCategories([
          { id: 'all', name: 'All Items', icon: '📦' },
          ...categoriesData.data.categories
        ])
      }
      
      // Fetch suppliers
      const suppliersResponse = await adminFetch('/api/inventory/suppliers')
      const suppliersData = await suppliersResponse.json()
      
      if (suppliersData.success) {
        setSuppliers(suppliersData.data.suppliers)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to load inventory')
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  const filteredItems = inventoryItems?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filter === 'all' || item.category === filter
    const matchesType = item.type === viewType
    return matchesSearch && matchesCategory && matchesType
  })

  const lowStockItems = inventoryItems?.filter(item => item.quantity <= item.minStock)
  const totalValue = inventoryItems?.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const mainStockCount = inventoryItems?.filter(item => item.type === 'main').length
  const counterStockCount = inventoryItems?.filter(item => item.type === 'counter').length

  // Get category counts
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return inventoryItems?.filter(i => i.type === viewType).length
    return inventoryItems?.filter(i => i.category === categoryId && i.type === viewType).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        // Update existing item
        const response = await adminFetch(`/api/inventory/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        
        const result = await response.json()
        
        if (result.success) {
          toast.success('Item updated successfully!')
          fetchData()
          resetForm()
        } else {
          toast.error(result.error || 'Failed to update item')
        }
      } else {
        // Create new item
        const response = await adminFetch('/api/inventory', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        
        const result = await response.json()
        
        if (result.success) {
          toast.success('Item added successfully!')
          fetchData()
          resetForm()
        } else {
          toast.error(result.error || 'Failed to add item')
        }
      }
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
    }
  }

  const handleAddSupply = async (e) => {
    e.preventDefault()
    if (!selectedItem) return

    try {
      const response = await adminFetch(`/api/inventory/${selectedItem._id}/add-stock`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: parseFloat(supplyData.quantity),
          price: supplyData.price ? parseFloat(supplyData.price) : undefined,
          supplier: supplyData.supplier || undefined,
          notes: supplyData.notes || undefined
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Added ${supplyData.quantity} ${selectedItem.unit} of ${selectedItem.name}`)
        fetchData()
        setShowSupplyModal(false)
        setSelectedItem(null)
        setSupplyData({ quantity: '', price: '', supplier: '', notes: '' })
      } else {
        toast.error(result.error || 'Failed to add supply')
      }
    } catch (error) {
      console.error('Error adding supply:', error)
      toast.error('Failed to add supply')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      type: item.type,
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.minStock,
      price: item.price,
      supplier: item.supplier || '',
      description: item.description || ''
    })
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const response = await adminFetch(`/api/inventory/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Item deleted successfully!')
        fetchData()
      } else {
        toast.error(result.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      type: 'main',
      quantity: '',
      unit: 'kg',
      minStock: '',
      price: '',
      supplier: '',
      description: ''
    })
    setEditingItem(null)
    setShowAddModal(false)
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
                    className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-orange-300 transition-all"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                      <span className="mr-3">📦</span>
                      Inventory Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {inventoryItems?.length} items • {lowStockItems?.length} low stock alerts
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    resetForm()
                    setShowAddModal(true)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Item</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-700">Total Items</p>
                    <span className="text-2xl">📦</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{inventoryItems?.length}</p>
                  <p className="text-xs text-blue-600 mt-1">Main: {mainStockCount} • Counter: {counterStockCount}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-700">Total Value</p>
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">₹{totalValue?.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">Current stock value</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border-2 border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-red-700">Low Stock</p>
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-3xl font-bold text-red-900">{lowStockItems?.length}</p>
                  <p className="text-xs text-red-600 mt-1">Items need restock</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700">Suppliers</p>
                    <span className="text-2xl">🚚</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{suppliers?.length}</p>
                  <p className="text-xs text-purple-600 mt-1">Active suppliers</p>
                </div>
              </div>

              {/* View Type Toggle */}
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={() => setViewType('main')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    viewType === 'main'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  🍽️ Main Stock ({mainStockCount})
                </button>
                <button
                  onClick={() => setViewType('counter')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    viewType === 'counter'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  🥤 Counter Stock ({counterStockCount})
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search inventory items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilter(category.id)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                      filter === category.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {category.icon} {category.name} ({getCategoryCount(category.id)})
                  </button>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems?.length > 0 && (
              <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-bold text-red-900 text-lg">Low Stock Alerts</h3>
                    <p className="text-sm text-red-700">{lowStockItems.length} items need restocking</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {lowStockItems?.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      onClick={() => setSelectedItem(item)}
                      className="p-3 bg-white rounded-xl border-2 border-red-300 hover:border-red-400 transition-all cursor-pointer"
                    >
                      <p className="font-semibold text-gray-900 text-sm mb-1">{item.name}</p>
                      <p className="text-red-600 font-bold text-xs">
                        {item.quantity} {item.unit} remaining
                      </p>
                    </div>
                  ))}
                  {lowStockItems?.length > 4 && (
                    <div className="p-3 bg-white rounded-xl border-2 border-red-300 flex items-center justify-center text-red-700 font-semibold text-sm">
                      +{lowStockItems.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory Grid */}
            {filteredItems?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer hover:shadow-xl hover:scale-105 ${
                      item.quantity <= item.minStock
                        ? 'border-red-300 hover:border-red-400 bg-red-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(item)
                        }}
                        className="p-1.5 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item._id)
                        }}
                        className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Item Icon */}
                    <div className="text-4xl mb-3">{item.icon || '📦'}</div>

                    {/* Item Name */}
                    <h3 className="font-bold text-gray-900 text-lg mb-2 pr-16">{item.name}</h3>

                    {/* Stock Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className={`font-bold ${
                          item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Min:</span>
                        <span className="text-gray-700 font-medium">{item.minStock} {item.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="text-orange-600 font-bold">₹{item.price}</span>
                      </div>
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.quantity <= item.minStock ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((item.quantity / item.minStock) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                      item.quantity <= item.minStock
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.quantity <= item.minStock ? '⚠️ Low Stock' : '✅ In Stock'}
                    </div>

                    {/* Category Badge */}
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 capitalize">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl">
                <span className="text-6xl mb-4 block">📦</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Items Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `No items match "${searchTerm}"`
                    : 'No inventory items in this category'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilter('all')
                  }}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder="e.g., Tomatoes, Cooking Oil"
                />
              </div>

              {/* Category and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  >
                    <option value="main">Main Stock</option>
                    <option value="counter">Counter Stock</option>
                  </select>
                </div>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters</option>
                    <option value="pieces">Pieces</option>
                    <option value="bottles">Bottles</option>
                    <option value="packets">Packets</option>
                    <option value="cups">Cups</option>
                    <option value="packs">Packs</option>
                  </select>
                </div>
              </div>

              {/* Min Stock and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Stock Level *</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                    placeholder="e.g., 20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Unit *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                    placeholder="e.g., 40"
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder="e.g., Fresh Farms"
                  list="suppliers-list"
                />
                <datalist id="suppliers-list">
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier.name} />
                  ))}
                </datalist>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supply Modal */}
      {showSupplyModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Supply</h2>
            <p className="text-gray-600 mb-6">Restocking: {selectedItem.name}</p>
            
            <form onSubmit={handleAddSupply} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity to Add *</label>
                <input
                  type="number"
                  value={supplyData.quantity}
                  onChange={(e) => setSupplyData({ ...supplyData, quantity: e.target.value })}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder={`Amount in ${selectedItem.unit}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Unit (Optional)</label>
                <input
                  type="number"
                  value={supplyData.price}
                  onChange={(e) => setSupplyData({ ...supplyData, price: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder={`Current: ₹${selectedItem.price}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier (Optional)</label>
                <input
                  type="text"
                  value={supplyData.supplier}
                  onChange={(e) => setSupplyData({ ...supplyData, supplier: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder={selectedItem.supplier || 'Supplier name'}
                  list="suppliers-list"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={supplyData.notes}
                  onChange={(e) => setSupplyData({ ...supplyData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  Add Supply
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
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-4xl">{selectedItem.icon || '📦'}</span>
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
                <p className="text-2xl font-bold text-orange-600">₹{selectedItem.price}</p>
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
            {selectedItem.supplier && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Supplier</p>
                <p className="font-bold text-blue-900">{selectedItem.supplier}</p>
                <p className="text-xs text-blue-600 mt-2">
                  Last Updated: {new Date(selectedItem.updatedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

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
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
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