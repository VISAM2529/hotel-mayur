'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import toast from 'react-hot-toast'

export default function MenuManagementPage() {
  const router = useRouter()
  const { isAuthenticated, adminFetch, loading: authLoading } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Data states
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    isAvailable: true,
    spiceLevel: 'medium',
    isVegetarian: true,
    preparationTime: 15,
    discount: 0
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
      
      // Fetch categories
      const categoriesResponse = await adminFetch('/api/categories?isActive=true&includeItemCount=true')
      const categoriesData = await categoriesResponse.json()
      
      if (categoriesData.success) {
        const allCategory = {
          _id: 'all',
          name: 'All Items',
          icon: '📋',
          itemCount: 0
        }
        setCategories([allCategory, ...categoriesData.data.categories])
      }
      
      // Fetch menu items
      const menuResponse = await adminFetch('/api/menu/items?sortBy=name&sortOrder=asc')
      const menuData = await menuResponse.json()
      
      if (menuData.success) {
        setMenuItems(menuData.data.items)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load menu data')
      setLoading(false)
    }
  }

  // Create menu item
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image || null,
        isAvailable: formData.isAvailable,
        spiceLevel: formData.spiceLevel,
        isVegetarian: formData.isVegetarian,
        preparationTime: parseInt(formData.preparationTime),
        discount: parseInt(formData.discount) || 0
      }

      const url = editingItem 
        ? `/api/menu/items/${editingItem._id}`
        : '/api/menu/items'
      
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await adminFetch(url, {
        method: method,
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(editingItem ? 'Dish updated successfully!' : 'Dish added successfully!')
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || 'Failed to save dish')
      }
    } catch (error) {
      console.error('Error saving dish:', error)
      toast.error('Failed to save dish')
    }
  }

  // Delete menu item
  const handleDelete = async () => {
    if (!itemToDelete) return
    
    try {
      const response = await adminFetch(`/api/menu/items/${itemToDelete._id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Dish deleted successfully!')
        setShowDeleteModal(false)
        setItemToDelete(null)
        fetchData()
      } else {
        toast.error(result.error || 'Failed to delete dish')
      }
    } catch (error) {
      console.error('Error deleting dish:', error)
      toast.error('Failed to delete dish')
    }
  }

  // Toggle availability
  const handleToggleAvailability = async (item) => {
    try {
      const response = await adminFetch(`/api/menu/items/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...item,
          isAvailable: !item.isAvailable
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`)
        fetchData()
      } else {
        toast.error('Failed to update availability')
      }
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast.error('Failed to update availability')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category._id,
      price: item.price,
      description: item.description,
      image: item.image || '',
      isAvailable: item.isAvailable,
      spiceLevel: item.spiceLevel || 'medium',
      isVegetarian: item.isVegetarian !== undefined ? item.isVegetarian : true,
      preparationTime: item.preparationTime || 15,
      discount: item.discount || 0
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      image: '',
      isAvailable: true,
      spiceLevel: 'medium',
      isVegetarian: true,
      preparationTime: 15,
      discount: 0
    })
    setEditingItem(null)
    setShowAddModal(false)
  }

  const openDeleteModal = (item) => {
    setItemToDelete(item)
    setShowDeleteModal(true)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filter === 'all' || item.category._id === filter
    return matchesSearch && matchesCategory
  })

  const availableCount = menuItems.filter(item => item.isAvailable).length
  const unavailableCount = menuItems.filter(item => !item.isAvailable).length
  const offersCount = menuItems.filter(item => item.discount > 0).length

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
                      <span className="mr-3">🍽️</span>
                      Menu Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {menuItems.length} items • {availableCount} available • {offersCount} with offers
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add New Dish</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-600">Total Items</p>
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{menuItems.length}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-700">Available</p>
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{availableCount}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border-2 border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-red-700">Unavailable</p>
                    <span className="text-2xl">❌</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{unavailableCount}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-orange-700">With Offers</p>
                    <span className="text-2xl">🎁</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{offersCount}</p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search dishes..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => setFilter(category._id)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                      filter === category._id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      filter === category._id ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {category.itemCount || menuItems.filter(item => category._id === 'all' || item.category._id === category._id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-gray-200 hover:border-orange-300 overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-6xl">🍽️</span>
                      )}
                      
                      {/* Discount Badge */}
                      {item.discount > 0 && (
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-bold shadow-lg">
                          {item.discount}% OFF
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Veg/Non-veg Badge */}
                      <div className={`absolute bottom-3 left-3 w-6 h-6 border-2 rounded flex items-center justify-center ${
                        item.isVegetarian ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          item.isVegetarian ? 'bg-green-600' : 'bg-red-600'
                        }`}></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          {item.discount > 0 ? (
                            <div>
                              <p className="text-xs text-gray-400 line-through">
                                ₹{item.price}
                              </p>
                              <p className="text-xl font-bold text-orange-600">
                                ₹{Math.round(item.price * (1 - item.discount / 100))}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xl font-bold text-orange-600">
                              ₹{item.price}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Prep time</p>
                          <p className="text-sm font-semibold text-gray-700">{item.preparationTime} min</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                          {item.category.name}
                        </span>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center space-x-1"
                        >
                          <span>View Details</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl">
                <span className="text-6xl mb-4 block">🍽️</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Dishes Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search' : 'Start by adding your first dish'}
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingItem ? 'Edit Dish' : 'Add New Dish'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dish Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder="e.g., Butter Chicken"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat._id !== 'all').map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                    placeholder="e.g., 250"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all resize-none"
                  placeholder="Describe the dish..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Prep Time & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    min="1"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Spice Level & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Spice Level
                  </label>
                  <select
                    value={formData.spiceLevel}
                    onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  >
                    <option value="mild">🟢 Mild</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hot">🔴 Hot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.value === 'true' })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all"
                  >
                    <option value="true">🟢 Vegetarian</option>
                    <option value="false">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Mark as available for ordering
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                >
                  {editingItem ? 'Update Dish' : 'Add Dish'}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Dish?</h2>
              <p className="text-gray-600">
                Are you sure you want to delete &apos;{itemToDelete.name}&apos;? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setItemToDelete(null)
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-12 h-12 rounded-lg mr-3 object-cover" />
                ) : (
                  <span className="mr-3 text-4xl">🍽️</span>
                )}
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
              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                <p className="text-sm text-orange-700 mb-1">Price</p>
                <p className="text-2xl font-bold text-orange-600">₹{selectedItem.price}</p>
                {selectedItem.discount > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    {selectedItem.discount}% discount applied
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="text-lg font-bold text-gray-900">{selectedItem.category.icon} {selectedItem.category.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className={`text-lg font-bold ${selectedItem.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedItem.isAvailable ? '✅ Available' : '❌ Unavailable'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Prep Time</p>
                <p className="text-lg font-bold text-gray-900">⏱️ {selectedItem.preparationTime} min</p>
              </div>
            </div>

            {selectedItem.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Description</p>
                <p className="text-gray-900">{selectedItem.description}</p>
              </div>
            )}

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl border-2 border-gray-200">
                <div className={`w-6 h-6 border-2 rounded flex items-center justify-center ${
                  selectedItem.isVegetarian ? 'border-green-600' : 'border-red-600'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    selectedItem.isVegetarian ? 'bg-green-600' : 'bg-red-600'
                  }`}></div>
                </div>
                <span className="font-semibold text-gray-700">
                  {selectedItem.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                </span>
              </div>
              
              <div className="px-4 py-2 bg-gray-50 rounded-xl border-2 border-gray-200">
                <span className="font-semibold text-gray-700">
                  {selectedItem.spiceLevel === 'mild' && '🟢 Mild'}
                  {selectedItem.spiceLevel === 'medium' && '🟡 Medium'}
                  {selectedItem.spiceLevel === 'hot' && '🔴 Hot'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null)
                  handleEdit(selectedItem)
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                Edit Dish
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
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}