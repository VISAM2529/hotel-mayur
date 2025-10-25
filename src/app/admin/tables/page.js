'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import toast from 'react-hot-toast'

export default function TablesManagementPage() {
  const router = useRouter()
  const { currentAdmin, isAuthenticated, adminFetch, loading: authLoading } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  
  // Data states
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  
  // Modal states
  const [selectedTable, setSelectedTable] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showTableDetailsModal, setShowTableDetailsModal] = useState(false)
  
  // Merge states
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedForMerge, setSelectedForMerge] = useState([])
  
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
  
  // Form state
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    type: 'Non-AC',
    floor: 'Ground',
    status: 'available'
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
      
      // Fetch tables
      const tablesResponse = await adminFetch('/api/tables')
      const tablesData = await tablesResponse.json()
      
      if (tablesData.success) {
        setTables(tablesData.data.tables)
      }
      
      // Fetch all active orders
      const ordersResponse = await adminFetch('/api/orders?status=pending,confirmed,preparing,ready,served&populate=true')
      const ordersData = await ordersResponse.json()
      
      if (ordersData.success) {
        setOrders(ordersData.data.orders)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load tables')
      setLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await adminFetch('/api/menu/items')
      const data = await response.json()
      
      if (data.success) {
        setMenuItems(data.data.items || [])
        
        const items = data.data.items || []
        const categoryMap = new Map()
        
        items.forEach(item => {
          if (item.category) {
            if (typeof item.category === 'object' && item.category !== null) {
              const catId = item.category._id || item.category.name
              if (catId && !categoryMap.has(catId)) {
                categoryMap.set(catId, {
                  id: catId,
                  name: item.category.name || catId,
                  icon: item.category.icon || '📁'
                })
              }
            } else if (typeof item.category === 'string') {
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
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu')
    }
  }

  // Get orders for specific table
  const getTableOrders = (tableNumber) => {
    return orders.filter(order => 
      order.tableNumber === tableNumber &&
      ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status)
    )
  }

  // Calculate total amount for table
  const getTableTotal = (tableNumber) => {
    const tableOrders = getTableOrders(tableNumber)
    return tableOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  }

  // Navigate to billing page with order data
  const handleCreateBill = (table, tableOrders) => {
    if (!tableOrders || tableOrders.length === 0) {
      toast.error('No orders to bill')
      return
    }
    
    // Navigate to billing page with table and order IDs
    const orderIds = tableOrders.map(o => o._id).join(',')
    router.push(`/admin/billing/create?table=${table.tableNumber}&tableId=${table._id}&orders=${orderIds}`)
  }

  // Manual Order Functions
  const handlePlaceManualOrder = async (table) => {
    setSelectedTableForOrder(table)
    setShowManualOrderModal(true)
    setSelectedItems([])
    setCustomerName('')
    setCustomerPhone('')
    setSpecialInstructions('')
    setSearchQuery('')
    setCategoryFilter('all')
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
        placedBy: currentAdmin?._id
      }

      const response = await adminFetch('/api/orders/', {
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

  const getCategoryId = (item) => {
    if (!item.category) return null
    if (typeof item.category === 'object') {
      return item.category._id || item.category.name
    }
    return item.category
  }

  const getCategoryName = (item) => {
    if (!item.category) return 'Unknown'
    if (typeof item.category === 'object') {
      return item.category.name || 'Unknown'
    }
    return item.category
  }

  // Create table
  const handleCreateTable = async (e) => {
    e.preventDefault()
    
    try {
      const response = await adminFetch('/api/tables', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Table created successfully!')
        setShowCreateModal(false)
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || 'Failed to create table')
      }
    } catch (error) {
      console.error('Error creating table:', error)
      toast.error('Failed to create table')
    }
  }

  // Update table
  const handleUpdateTable = async (e) => {
    e.preventDefault()
    
    try {
      const response = await adminFetch(`/api/tables/${selectedTable._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Table updated successfully!')
        setShowEditModal(false)
        setSelectedTable(null)
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || 'Failed to update table')
      }
    } catch (error) {
      console.error('Error updating table:', error)
      toast.error('Failed to update table')
    }
  }

  // Delete table
  const handleDeleteTable = async () => {
    try {
      const response = await adminFetch(`/api/tables/${selectedTable._id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Table deleted successfully!')
        setShowDeleteModal(false)
        setSelectedTable(null)
        fetchData()
      } else {
        toast.error(result.error || 'Failed to delete table')
      }
    } catch (error) {
      console.error('Error deleting table:', error)
      toast.error('Failed to delete table')
    }
  }

  // Merge tables
  const handleMergeTables = async () => {
    if (selectedForMerge.length < 2) {
      toast.error('Please select at least 2 tables to merge')
      return
    }

    try {
      const response = await adminFetch('/api/tables/merge', {
        method: 'POST',
        body: JSON.stringify({
          tableIds: selectedForMerge
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Tables merged successfully!')
        setMergeMode(false)
        setSelectedForMerge([])
        fetchData()
      } else {
        toast.error(result.error || 'Failed to merge tables')
      }
    } catch (error) {
      console.error('Error merging tables:', error)
      toast.error('Failed to merge tables')
    }
  }

  const resetForm = () => {
    setFormData({
      tableNumber: '',
      capacity: 4,
      type: 'Non-AC',
      floor: 'Ground',
      status: 'available'
    })
  }

  const openEditModal = (table) => {
    setSelectedTable(table)
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      type: table.type,
      floor: table.floor,
      status: table.status
    })
    setShowEditModal(true)
  }

  const openTableDetails = (table) => {
    setSelectedTable(table)
    setShowTableDetailsModal(true)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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

  const stats = {
    total: tables.length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    available: tables.filter(t => t.status === 'available').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main content with sidebar margin */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Tables Management</h1>
                  <p className="text-gray-600 mt-1">{tables.length} tables in restaurant</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Manual Order Button */}
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
                    <span>Place Order</span>
                  </button>

                  {mergeMode ? (
                    <>
                      <button
                        onClick={handleMergeTables}
                        disabled={selectedForMerge.length < 2}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          selectedForMerge.length >= 2
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Merge Selected ({selectedForMerge.length})
                      </button>
                      <button
                        onClick={() => {
                          setMergeMode(false)
                          setSelectedForMerge([])
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setMergeMode(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                      >
                        Merge Tables
                      </button>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all"
                      >
                        + Add Table
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Tables</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🪑</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Occupied</p>
                      <p className="text-3xl font-bold text-red-600">{stats.occupied}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🔴</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Available</p>
                      <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🟢</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Occupancy</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('occupied')}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    filter === 'occupied'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Occupied ({stats.occupied})
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    filter === 'available'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Available ({stats.available})
                </button>
                <button
                  onClick={() => setFilter('reserved')}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    filter === 'reserved'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Reserved ({stats.reserved})
                </button>
              </div>
            </div>

            {/* Tables Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {filteredTables.map((table) => {
    const tableOrders = getTableOrders(table.tableNumber)
    const tableTotal = getTableTotal(table.tableNumber)
    const isSelected = selectedForMerge.includes(table._id)
    const totalItems = tableOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)
    
    return (
      <div
        key={table._id}
        onClick={() => {
          if (mergeMode) {
            if (isSelected) {
              setSelectedForMerge(selectedForMerge.filter(id => id !== table._id))
            } else {
              setSelectedForMerge([...selectedForMerge, table._id])
            }
          }
        }}
        className={`bg-white rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-lg
          ${mergeMode
            ? isSelected
              ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
              : 'border-gray-200 hover:border-blue-300'
            : table.status === 'occupied'
            ? 'border-red-200 hover:border-red-300'
            : table.status === 'reserved'
            ? 'border-blue-200 hover:border-blue-300'
            : 'border-green-200 hover:border-green-300'
          }
        `}
        style={{ 
          minHeight: '320px', 
          maxHeight: '320px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Fixed Header Section */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                table.status === 'occupied' ? 'bg-red-500 animate-pulse' :
                table.status === 'reserved' ? 'bg-blue-500' :
                'bg-green-500'
              }`}></div>
              <h3 className="text-2xl font-bold text-gray-900">
                {table.tableNumber}
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              table.status === 'occupied'
                ? 'bg-red-100 text-red-700'
                : table.status === 'reserved'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {table.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">{table.capacity} seats</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="font-medium">{table.type}</span>
          </div>
        </div>

        {/* Scrollable Content Section - Fixed Height */}
        <div className="flex-1 overflow-y-auto p-5" style={{ maxHeight: '140px' }}>
          {tableOrders.length > 0 ? (
            <div className="space-y-3">
              {/* Summary Badge */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{tableOrders.length}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Active Orders</p>
                    <p className="text-xs text-gray-500">{totalItems} items total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">₹{tableTotal}</p>
                </div>
              </div>

              {/* Compact Order List - Scrollable */}
              <div className="space-y-2">
                {tableOrders.map(order => (
                  <div key={order._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        order.status === 'ready' ? 'bg-green-500' :
                        order.status === 'preparing' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}></span>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">#{order.orderNumber}</span>
                        <span className="text-xs text-gray-500 ml-2">{order.items?.length || 0} items</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">₹{order.total}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">No active orders</p>
              <p className="text-xs text-gray-400">Table is {table.status}</p>
            </div>
          )}
        </div>

        {/* Fixed Footer Actions */}
        {!mergeMode && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="grid grid-cols-2 gap-2">
              {/* Primary Actions Row */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openTableDetails(table)
                }}
                className="px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-semibold shadow-sm hover:shadow-md flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlaceManualOrder(table)
                }}
                className="px-3 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm font-semibold shadow-sm hover:shadow-md flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Order</span>
              </button>
            </div>

            {/* Secondary Actions Row */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openEditModal(table)
                }}
                className="px-3 py-2 bg-white border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTable(table)
                  setShowDeleteModal(true)
                }}
                className="px-3 py-2 bg-white border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Merge Mode Selection Indicator */}
        {mergeMode && isSelected && (
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    )
  })}
</div>


            {filteredTables.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-gray-500 text-lg">No tables found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Table Details Modal with Create Bill */}
      {showTableDetailsModal && selectedTable && (
        <TableDetailsModal
          table={selectedTable}
          orders={getTableOrders(selectedTable.tableNumber)}
          onClose={() => {
            setShowTableDetailsModal(false)
            setSelectedTable(null)
          }}
          onEdit={openEditModal}
          onDelete={() => {
            setShowTableDetailsModal(false)
            setShowDeleteModal(true)
          }}
          onCreateBill={handleCreateBill}
        />
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {showCreateModal ? 'Create New Table' : 'Edit Table'}
            </h2>
            
            <form onSubmit={showCreateModal ? handleCreateTable : handleUpdateTable}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Ground">Ground</option>
                    <option value="First">First</option>
                    <option value="Second">Second</option>
                    <option value="Rooftop">Rooftop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setSelectedTable(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {showCreateModal ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Table</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete Table {selectedTable?.tableNumber}? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedTable(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTable}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Modal - Same as before */}
      {showManualOrderModal && (
        <ManualOrderModal
          selectedTableForOrder={selectedTableForOrder}
          setSelectedTableForOrder={setSelectedTableForOrder}
          tables={tables}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          filteredMenuItems={filteredMenuItems}
          getCategoryName={getCategoryName}
          handleAddItemToOrder={handleAddItemToOrder}
          selectedItems={selectedItems}
          handleUpdateQuantity={handleUpdateQuantity}
          handleUpdateCustomizations={handleUpdateCustomizations}
          specialInstructions={specialInstructions}
          setSpecialInstructions={setSpecialInstructions}
          calculateTotal={calculateTotal}
          handleSubmitManualOrder={handleSubmitManualOrder}
          submittingOrder={submittingOrder}
          onClose={() => setShowManualOrderModal(false)}
        />
      )}
    </div>
  )
}

// Table Details Modal Component with Create Bill Button
function TableDetailsModal({ table, orders, onClose, onEdit, onDelete, onCreateBill }) {
  const totalAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Table {table.tableNumber}</h2>
              <p className="text-blue-100 mt-1">{table.capacity} seats • {table.type} • {table.floor}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Active Orders */}
          {orders.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Active Orders ({orders.length})</h3>
              
              <div className="space-y-4 mb-6">
                {orders.map(order => (
                  <div key={order._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'ready' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">₹{order.total}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.menuItem?.name || 'Item'}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-sm text-gray-500">+{order.items.length - 3} more items</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CREATE BILL BUTTON */}
              <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-green-900 text-lg">Ready to Generate Bill?</p>
                    <p className="text-sm text-green-700">Create bill and complete all orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700">Bill Amount</p>
                    <p className="text-2xl font-bold text-green-600">₹{totalAmount}</p>
                  </div>
                </div>
                <button
                  onClick={() => onCreateBill(table, orders)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Create Bill</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
              <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 font-medium">No active orders on this table</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                onClose()
                onEdit(table)
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              ✏️ Edit Table
            </button>
            <button
              onClick={() => {
                onClose()
                onDelete()
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
            >
              🗑️ Delete Table
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Manual Order Modal Component (separate for clarity)
function ManualOrderModal({
  selectedTableForOrder,
  setSelectedTableForOrder,
  tables,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  categories,
  filteredMenuItems,
  getCategoryName,
  handleAddItemToOrder,
  selectedItems,
  handleUpdateQuantity,
  handleUpdateCustomizations,
  specialInstructions,
  setSpecialInstructions,
  calculateTotal,
  handleSubmitManualOrder,
  submittingOrder,
  onClose
}) {
  return (
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
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left: Menu Items */}
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

          {/* Right: Order Summary */}
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
  )
}