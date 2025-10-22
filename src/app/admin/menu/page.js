'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import toast from 'react-hot-toast'

export default function MenuManagementPage() {
  const router = useRouter()
  const { isAuthenticated } = useAdmin()
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/admin/login')
  //     return
  //   }
  //   setLoading(false)
  // }, [isAuthenticated, router])

  const categories = [
    { id: 'all', name: 'All Items', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ), count: 45 },
    { id: 'starters', name: 'Starters', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ), count: 12 },
    { id: 'vegetables', name: 'Vegetables', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ), count: 15 },
    { id: 'main-course', name: 'Main Course', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ), count: 18 },
    { id: 'roti', name: 'Roti & Breads', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ), count: 8 },
    { id: 'refreshments', name: 'Refreshments', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ), count: 7 },
    { id: 'liquid', name: 'Liquids', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ), count: 5 }
  ]

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Paneer Tikka',
      category: 'starters',
      price: 180,
      description: 'Grilled cottage cheese with spices',
      image: '🧀',
      available: true,
      specialOffer: { active: true, discount: 10, description: '10% off - Weekend Special' }
    },
    {
      id: 2,
      name: 'Butter Chicken',
      category: 'main-course',
      price: 280,
      description: 'Creamy tomato-based chicken curry',
      image: '🍗',
      available: true,
      specialOffer: { active: false }
    },
    {
      id: 3,
      name: 'Butter Naan',
      category: 'roti',
      price: 40,
      description: 'Soft butter naan bread',
      image: '🫓',
      available: true,
      specialOffer: { active: false }
    },
    {
      id: 4,
      name: 'Fresh Lime Soda',
      category: 'refreshments',
      price: 60,
      description: 'Refreshing lime soda with ice',
      image: '🍋',
      available: true,
      specialOffer: { active: true, discount: 15, description: 'Summer Special' }
    },
    {
      id: 5,
      name: 'Palak Paneer',
      category: 'vegetables',
      price: 200,
      description: 'Spinach curry with cottage cheese',
      image: '🥬',
      available: true,
      specialOffer: { active: false }
    },
    {
      id: 6,
      name: 'Mineral Water',
      category: 'liquid',
      price: 20,
      description: '1L bottled water',
      image: '💧',
      available: true,
      specialOffer: { active: false }
    }
  ])

  const [formData, setFormData] = useState({
    name: '',
    category: 'starters',
    price: '',
    description: '',
    image: '🍽️',
    available: true,
    specialOffer: {
      active: false,
      discount: '',
      description: ''
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filter === 'all' || item.category === filter
    return matchesSearch && matchesCategory
  })

  const availableCount = menuItems.filter(item => item.available).length
  const unavailableCount = menuItems.filter(item => !item.available).length
  const offersCount = menuItems.filter(item => item.specialOffer.active).length

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? { ...formData, id: item.id } : item
      ))
      toast.success('Dish updated successfully!')
    } else {
      const newItem = {
        ...formData,
        id: Date.now(),
        price: parseFloat(formData.price)
      }
      setMenuItems([...menuItems, newItem])
      toast.success('Dish added successfully!')
    }
    resetForm()
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowAddModal(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(menuItems.filter(item => item.id !== id))
      toast.success('Dish deleted successfully!')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'starters',
      price: '',
      description: '',
      image: '🍽️',
      available: true,
      specialOffer: {
        active: false,
        discount: '',
        description: ''
      }
    })
    setEditingItem(null)
    setShowAddModal(false)
  }

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ))
    const item = menuItems.find(i => i.id === id)
    toast.success(`${item.name} marked as ${item.available ? 'unavailable' : 'available'}`)
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
                    className="w-10 h-10 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 transition-all"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                    <p className="text-gray-600 mt-1">{menuItems.length} dishes • {availableCount} available • {offersCount} special offers</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-md flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add New Dish</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Dishes</p>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{menuItems.length}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700">Available</p>
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{availableCount}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border-2 border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700">Unavailable</p>
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{unavailableCount}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-orange-700">Special Offers</p>
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{offersCount}</p>
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
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-300 transition-all"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center space-x-2 ${
                      filter === cat.id
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.name} ({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative bg-gradient-to-br from-orange-50 to-primary-50 p-8">
                    <div className="text-6xl text-center">{item.image}</div>
                    {item.specialOffer.active && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{item.specialOffer.discount}% OFF</span>
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
                      item.available ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.available ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <span>{item.available ? 'Available' : 'Unavailable'}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{item.category.replace('-', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">₹{item.price}</p>
                        {item.specialOffer.active && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹{Math.round(item.price / (1 - item.specialOffer.discount / 100))}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    
                    {item.specialOffer.active && (
                      <div className="mb-3 p-2 bg-orange-50 rounded-lg border-2 border-orange-200">
                        <p className="text-xs text-orange-700 font-medium flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{item.specialOffer.description}</span>
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleAvailability(item.id)
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                          item.available 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {item.available ? 'Mark Out' : 'Mark In'}
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
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={resetForm}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {editingItem ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
                <span>{editingItem ? 'Edit Dish' : 'Add New Dish'}</span>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="Enter dish name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-300 transition-all"
                  >
                    <option value="starters">Starters</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="main-course">Main Course</option>
                    <option value="roti">Roti & Breads</option>
                    <option value="refreshments">Refreshments</option>
                    <option value="liquid">Liquids</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon/Emoji</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-300 transition-all"
                    placeholder="🍽️"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-300 transition-all"
                  rows="3"
                  placeholder="Enter dish description"
                />
              </div>

              <div className="border-t-2 border-gray-200 pt-4">
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specialOffer.active}
                    onChange={(e) => setFormData({
                      ...formData,
                      specialOffer: { ...formData.specialOffer, active: e.target.checked }
                    })}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Add Special Offer</span>
                  </span>
                </label>

                {formData.specialOffer.active && (
                  <div className="grid grid-cols-2 gap-4 ml-7 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                    <div>
                      <label className="block text-sm font-semibold text-orange-700 mb-2">Discount (%)</label>
                      <input
                        type="number"
                        value={formData.specialOffer.discount}
                        onChange={(e) => setFormData({
                          ...formData,
                          specialOffer: { ...formData.specialOffer, discount: e.target.value }
                        })}
                        className="w-full px-4 py-2.5 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-400 transition-all"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-orange-700 mb-2">Offer Description</label>
                      <input
                        type="text"
                        value={formData.specialOffer.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          specialOffer: { ...formData.specialOffer, description: e.target.value }
                        })}
                        className="w-full px-4 py-2.5 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-400 transition-all"
                        placeholder="Weekend Special"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-md"
                >
                  {editingItem ? 'Update Dish' : 'Add Dish'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-4xl">{selectedItem.image}</span>
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

            {/* Item Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-2xl font-bold text-primary-600">₹{selectedItem.price}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{selectedItem.category.replace('-', ' ')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className={`text-2xl font-bold flex items-center space-x-2 ${selectedItem.available ? 'text-green-600' : 'text-red-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {selectedItem.available ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <span>{selectedItem.available ? 'Available' : 'Unavailable'}</span>
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Special Offer</p>
                <p className={`text-lg font-bold flex items-center space-x-2 ${selectedItem.specialOffer.active ? 'text-orange-600' : 'text-gray-400'}`}>
                  {selectedItem.specialOffer.active ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{selectedItem.specialOffer.discount}% OFF</span>
                    </>
                  ) : (
                    <span>None</span>
                  )}
                </p>
              </div>
            </div>

            {selectedItem.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{selectedItem.description}</p>
              </div>
            )}

            {selectedItem.specialOffer.active && (
              <div className="mb-6 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <p className="text-sm text-orange-700 font-semibold mb-1 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Active Offer</span>
                </p>
                <p className="text-orange-900 font-bold">{selectedItem.specialOffer.description}</p>
                <p className="text-sm text-orange-600 mt-2">
                  Original Price: ₹{Math.round(selectedItem.price / (1 - selectedItem.specialOffer.discount / 100))} 
                  → Now: ₹{selectedItem.price} (Save ₹{Math.round(selectedItem.price / (1 - selectedItem.specialOffer.discount / 100)) - selectedItem.price})
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null)
                  handleEdit(selectedItem)
                }}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-md"
              >
                Edit Dish
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
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