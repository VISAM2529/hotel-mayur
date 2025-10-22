'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'

export default function TableLandingPage() {
  const router = useRouter()
  const params = useParams()
  const { setTableNumber } = useCart()
  const tableId = params.tableId
  const [loading, setLoading] = useState(true)
  const [tableValid, setTableValid] = useState(false)
  const [tableData, setTableData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Validate table and check if it's available
    const validateTable = async () => {
      try {
        // Check if table exists and is active
        const response = await fetch(`/api/tables?tableNumber=${tableId}`)
        const result = await response.json()

        if (result.success && result.data.tables.length > 0) {
          const table = result.data.tables[0]
          
          // Check if table is available or occupied (can still order)
          if (table.isActive && ['available', 'occupied'].includes(table.status)) {
            setTableData(table)
            setTableValid(true)
            
            // Save table number to context
            setTableNumber(tableId)
            localStorage.setItem('tableNumber', tableId)
            localStorage.setItem('tableId', table._id) // Save table ObjectId for orders
          } else {
            setError(`Table #${tableId} is currently ${table.status}. Please contact staff.`)
          }
        } else {
          setError(`Table #${tableId} not found. Please scan a valid QR code.`)
        }
      } catch (err) {
        console.error('Error validating table:', err)
        setError('Failed to validate table. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (tableId) {
      validateTable()
    } else {
      setError('Invalid QR code. Please scan again.')
      setLoading(false)
    }
  }, [tableId, setTableNumber])

  const handleStartOrder = () => {
    router.push('/order/menu')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Validating table...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
            Table Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-slide-up">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Welcome Message */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Welcome to Hotel Mayur!
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          You&apos;re seated at
        </p>
        <div className="inline-block bg-primary-100 text-primary-700 px-6 py-3 rounded-full mb-2">
          <p className="text-2xl font-bold">Table #{tableId}</p>
        </div>
        
        {/* Table Info */}
        {tableData && (
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{tableData.location.charAt(0).toUpperCase() + tableData.location.slice(1)}</span>
              {tableData.floor && (
                <>
                  <span>•</span>
                  <span>{tableData.floor}</span>
                </>
              )}
              {tableData.capacity && (
                <>
                  <span>•</span>
                  <span>Seats {tableData.capacity}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Restaurant Info */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-display text-xl font-bold text-gray-900">Hotel Mayur</span>
          </div>
          <p className="text-gray-600 text-sm">
            Scan → Browse → Order → Enjoy!
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📱</span>
            </div>
            <p className="text-xs text-gray-600">Digital Menu</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-xs text-gray-600">Quick Order</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-xs text-gray-600">Contactless</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          variant="primary" 
          className="w-full text-lg py-4 mb-4"
          onClick={handleStartOrder}
        >
          View Menu & Order
        </Button>

        <p className="text-sm text-gray-500">
          Need help? Call a waiter or scan the QR again
        </p>
      </div>
    </div>
  )
}