'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useOrders } from '@/context/OrdersContext'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { tables } from '@/data/tables'
import toast from 'react-hot-toast'

export default function TablesManagementPage() {
  const router = useRouter()
  const { isAuthenticated } = useAdmin()
  const { orders } = useOrders()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selectedTable, setSelectedTable] = useState(null)
  const [draggedTable, setDraggedTable] = useState(null)
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedForMerge, setSelectedForMerge] = useState([])
  const [mergedTables, setMergedTables] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }
    setLoading(false)
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    )
  }

  // Get active orders for tables
  const getTableOrders = (tableNumber) => {
    return orders.filter(order => 
      parseInt(order.tableNumber) === tableNumber &&
      ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status)
    )
  }

  // Filter tables
  const filteredTables = tables.filter(table => {
    if (filter === 'occupied') return table.status === 'occupied'
    if (filter === 'vacant') return table.status === 'vacant'
    if (filter === 'ac') return table.type === 'AC'
    if (filter === 'non-ac') return table.type === 'Non-AC'
    if (filter === 'ground') return table.floor === 'Ground'
    if (filter === 'first') return table.floor === 'First'
    return true
  })

  const occupiedCount = tables.filter(t => t.status === 'occupied').length
  const vacantCount = tables.filter(t => t.status === 'vacant').length
  const acCount = tables.filter(t => t.type === 'AC').length

  const handleTableClick = (table) => {
    if (mergeMode) {
      handleMergeSelection(table)
    } else {
      const tableOrders = getTableOrders(table.number)
      setSelectedTable({ ...table, orders: tableOrders })
    }
  }

  const handleMergeSelection = (table) => {
    if (selectedForMerge.find(t => t.id === table.id)) {
      setSelectedForMerge(selectedForMerge.filter(t => t.id !== table.id))
    } else {
      setSelectedForMerge([...selectedForMerge, table])
    }
  }

  const handleMergeTables = () => {
    if (selectedForMerge.length < 2) {
      toast.error('Please select at least 2 tables to merge')
      return
    }

    const mergedTable = {
      id: `merged-${Date.now()}`,
      numbers: selectedForMerge.map(t => t.number),
      capacity: selectedForMerge.reduce((sum, t) => sum + t.capacity, 0),
      status: 'vacant',
      mergedAt: new Date().toISOString()
    }

    setMergedTables([...mergedTables, mergedTable])
    setSelectedForMerge([])
    setMergeMode(false)
    toast.success(`Tables ${mergedTable.numbers.join(', ')} merged successfully!`)
  }

  const handleSplitTable = (mergedTableId) => {
    const updatedMerged = mergedTables.filter(t => t.id !== mergedTableId)
    setMergedTables(updatedMerged)
    toast.success('Tables split successfully!')
  }

  const handleDragStart = (e, table) => {
    setDraggedTable(table)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetTable) => {
    e.preventDefault()
    if (draggedTable && draggedTable.id !== targetTable.id) {
      // Create merged table from drag and drop
      const mergedTable = {
        id: `merged-${Date.now()}`,
        numbers: [draggedTable.number, targetTable.number],
        capacity: draggedTable.capacity + targetTable.capacity,
        status: 'vacant',
        mergedAt: new Date().toISOString()
      }
      setMergedTables([...mergedTables, mergedTable])
      toast.success(`Tables ${draggedTable.number} and ${targetTable.number} merged!`)
    }
    setDraggedTable(null)
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
                    <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
                    <p className="text-gray-600 mt-1">{tables.length} tables • {occupiedCount} occupied • {vacantCount} vacant</p>
                  </div>
                </div>

                {/* Merge Mode Toggle */}
                <button
                  onClick={() => {
                    setMergeMode(!mergeMode)
                    setSelectedForMerge([])
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                    mergeMode
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>{mergeMode ? 'Cancel Merge' : 'Merge Tables'}</span>
                </button>
              </div>

              {/* Merge Mode Banner */}
              {mergeMode && (
                <div className="mb-6 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-orange-900">Merge Mode Active</p>
                        <p className="text-sm text-orange-700">
                          {selectedForMerge.length === 0 ? 'Select tables to merge' : `${selectedForMerge.length} tables selected`}
                        </p>
                      </div>
                    </div>
                    {selectedForMerge.length >= 2 && (
                      <button
                        onClick={handleMergeTables}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all"
                      >
                        Merge {selectedForMerge.length} Tables
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Tables</p>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border-2 border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700">Occupied</p>
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{occupiedCount}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700">Vacant</p>
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{vacantCount}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-700">Occupancy</p>
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.round((occupiedCount / tables.length) * 100)}%
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    filter === 'all'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  All ({tables.length})
                </button>
                <button
                  onClick={() => setFilter('occupied')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center space-x-2 ${
                    filter === 'occupied'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="6" />
                  </svg>
                  <span>Occupied ({occupiedCount})</span>
                </button>
                <button
                  onClick={() => setFilter('vacant')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center space-x-2 ${
                    filter === 'vacant'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="6" />
                  </svg>
                  <span>Vacant ({vacantCount})</span>
                </button>
                <button
                  onClick={() => setFilter('ac')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center space-x-2 ${
                    filter === 'ac'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>AC ({acCount})</span>
                </button>
                <button
                  onClick={() => setFilter('non-ac')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    filter === 'non-ac'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  Non-AC ({tables.length - acCount})
                </button>
                <button
                  onClick={() => setFilter('ground')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    filter === 'ground'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  Ground Floor
                </button>
                <button
                  onClick={() => setFilter('first')}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                    filter === 'first'
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  First Floor
                </button>
              </div>
            </div>

            {/* Merged Tables Section */}
            {mergedTables.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Merged Tables</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mergedTables.map((merged) => (
                    <div key={merged.id} className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-300 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg text-gray-900">
                            Tables {merged.numbers.join(' + ')}
                          </p>
                          <p className="text-sm text-gray-600">{merged.capacity} seats total</p>
                        </div>
                        <button
                          onClick={() => handleSplitTable(merged.id)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-all"
                          title="Split Tables"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          merged.status === 'occupied' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {merged.status === 'occupied' ? 'Occupied' : 'Vacant'}
                        </span>
                        <button
                          onClick={() => router.push(`/admin/billing/create?table=${merged.numbers.join(',')}`)}
                          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:from-primary-600 hover:to-orange-600 transition-all"
                        >
                          Create Bill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tables Grid */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Individual Tables</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {filteredTables.map((table) => {
                  const tableOrders = getTableOrders(table.number)
                  const isSelected = selectedForMerge.find(t => t.id === table.id)
                  
                  return (
                    <div
                      key={table.id}
                      draggable={!mergeMode}
                      onDragStart={(e) => handleDragStart(e, table)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, table)}
                      onClick={() => handleTableClick(table)}
                      className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        draggedTable?.id === table.id ? 'opacity-50 scale-95' : 'hover:scale-105'
                      } ${
                        isSelected ? 'border-orange-500 bg-orange-100 shadow-lg' :
                        table.status === 'occupied'
                          ? 'bg-gradient-to-br from-red-50 to-rose-100 border-red-400 hover:border-red-500 hover:shadow-xl'
                          : 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-400 hover:border-green-500 hover:shadow-xl'
                      }`}
                    >
                      <svg className="w-12 h-12 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <p className="font-bold text-2xl text-gray-900">{table.number}</p>
                      <p className="text-xs text-gray-600 mt-1">{table.capacity} seats</p>
                      <p className="text-xs text-gray-600">{table.type}</p>
                      {tableOrders.length > 0 && (
                        <div className="mt-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                          {tableOrders.length} {tableOrders.length === 1 ? 'order' : 'orders'}
                        </div>
                      )}
                      {isSelected && (
                        <div className="mt-2 px-2 py-1 bg-orange-600 text-white rounded-full text-xs font-bold">
                          Selected
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Drag Drop Help */}
            {!mergeMode && (
              <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900">Tip: Drag & Drop to Merge</p>
                    <p className="text-sm text-blue-700">Drag one table and drop it on another to merge them quickly!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Table Details Modal */}
      {selectedTable && !mergeMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedTable(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-8 h-8 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Table {selectedTable.number}
              </h2>
              <button
                onClick={() => setSelectedTable(null)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Table Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{selectedTable.capacity} seats</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="text-2xl font-bold text-gray-900">{selectedTable.type}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Floor</p>
                <p className="text-2xl font-bold text-gray-900">{selectedTable.floor}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className={`text-2xl font-bold ${selectedTable.status === 'occupied' ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedTable.status === 'occupied' ? 'Occupied' : 'Vacant'}
                </p>
              </div>
            </div>

            {/* Active Orders */}
            {selectedTable.orders && selectedTable.orders.length > 0 ? (
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Active Orders ({selectedTable.orders.length})</h3>
                <div className="space-y-3">
                  {selectedTable.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-gray-50 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-all cursor-pointer border-2 border-gray-200 hover:border-primary-300"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.items.length} items • ₹{order.total.toFixed(0)}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  ))}
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
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push(`/admin/billing/create?table=${selectedTable.number}`)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-orange-600 transition-all shadow-lg"
              >
                Create Bill
              </button>
              <button
                onClick={() => setSelectedTable(null)}
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
      `}</style>
    </div>
  )
}