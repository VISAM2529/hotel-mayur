'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'
import Image from 'next/image'

export default function TableLandingPage() {
  const router = useRouter()
  const params = useParams()
  const { setTableNumber } = useCart()
  const tableId = params.tableId

  useEffect(() => {
    // Save table number to context
    setTableNumber(tableId)
    localStorage.setItem('tableNumber', tableId)
  }, [tableId, setTableNumber])

  const handleStartOrder = () => {
    router.push('/order/menu')
  }

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
        <div className="inline-block bg-primary-100 text-primary-700 px-6 py-3 rounded-full mb-6">
          <p className="text-2xl font-bold">Table #{tableId}</p>
        </div>

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