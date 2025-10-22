'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useKitchen } from '@/context/KitchenContext'
import { useState } from 'react'

export default function KitchenNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentStaff, logout, soundEnabled, toggleSound, autoRefresh, toggleAutoRefresh } = useKitchen()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      router.push('/kitchen/login')
    }
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-2xl">🍳</span>
            </div>
            <div className="hidden md:block">
              <h1 className="font-semibold text-lg text-gray-900">Kitchen Display</h1>
              <p className="text-xs text-gray-500">Real-time Order Management</p>
            </div>
          </div>
        </div>

        {/* Center - Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            href="/kitchen/dashboard"
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              pathname === '/kitchen/dashboard'
                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                : 'text-gray-600 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>KOT Dashboard</span>
          </Link>

          <Link
            href="/kitchen/history"
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              pathname === '/kitchen/history'
                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                : 'text-gray-600 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Date & Time */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-900">{getCurrentTime()}</p>
            <p className="text-xs text-gray-500">{getCurrentDate()}</p>
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-2 px-2 lg:px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
                soundEnabled 
                  ? 'bg-orange-50 border-orange-200 text-orange-600' 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
            >
              {soundEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Auto Refresh Toggle */}
            <button
              onClick={toggleAutoRefresh}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
                autoRefresh 
                  ? 'bg-orange-50 border-orange-200 text-orange-600' 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
              title={autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
            >
              <svg className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-10 w-px bg-gray-200"></div>

          {/* Staff Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all border border-gray-200"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{currentStaff?.name || 'Kitchen Staff'}</p>
                <p className="text-xs text-gray-500">{currentStaff?.role || 'Chef'}</p>
              </div>
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-xl">{currentStaff?.avatar || '👨‍🍳'}</span>
              </div>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{currentStaff?.name || 'Kitchen Staff'}</p>
                    <p className="text-xs text-gray-500">{currentStaff?.role || 'Chef'}</p>
                    <p className="text-xs text-gray-400 mt-1">{currentStaff?.specialization || 'All dishes'}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      router.push('/kitchen/dashboard')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Active Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/kitchen/history')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Order History</span>
                  </button>

                  <div className="my-1 border-t border-gray-200"></div>

                  <button
                    onClick={() => {
                      handleLogout()
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden px-4 py-3 border-t border-gray-200 flex items-center space-x-2 overflow-x-auto">
        <Link
          href="/kitchen/dashboard"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center space-x-2 ${
            pathname === '/kitchen/dashboard'
              ? 'bg-orange-50 text-orange-600 border border-orange-200'
              : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link
          href="/kitchen/history"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center space-x-2 ${
            pathname === '/kitchen/history'
              ? 'bg-orange-50 text-orange-600 border border-orange-200'
              : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>History</span>
        </Link>
      </div>
    </nav>
  )
}