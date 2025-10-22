'use client'

import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useOrders } from '@/context/OrdersContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminNavbar({ toggleSidebar }) {
  const router = useRouter()
  const { currentAdmin, logout } = useAdmin()
  const { orders } = useOrders()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      toast.success('Logged out successfully')
      router.push('/admin/login')
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
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 items-center justify-center transition-all"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="font-semibold text-lg text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-xs text-gray-500">Manage your restaurant operations</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Date & Time */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-900">{getCurrentTime()}</p>
            <p className="text-xs text-gray-500">{getCurrentDate()}</p>
          </div>

          {/* Pending Orders Notification */}
          {pendingOrdersCount > 0 && (
            <button
              onClick={() => router.push('/admin/orders/all')}
              className="relative px-3 py-2 lg:px-4 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-200 group"
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">{pendingOrdersCount}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-red-700 hidden sm:inline">
                  {pendingOrdersCount} Pending
                </span>
              </div>
            </button>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 px-2 lg:px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <button
              onClick={() => router.push('/admin/orders/all')}
              className="w-9 h-9 rounded-lg bg-white hover:bg-primary-50 hover:border-primary-200 flex items-center justify-center transition-all border border-gray-200 group"
              title="Orders"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>

            <button
              onClick={() => router.push('/admin/tables')}
              className="w-9 h-9 rounded-lg bg-white hover:bg-primary-50 hover:border-primary-200 flex items-center justify-center transition-all border border-gray-200 group"
              title="Tables"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </button>

            <button
              onClick={() => router.push('/admin/billing/create')}
              className="w-9 h-9 rounded-lg bg-white hover:bg-primary-50 hover:border-primary-200 flex items-center justify-center transition-all border border-gray-200 group"
              title="New Bill"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-10 w-px bg-gray-200"></div>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all border border-gray-200"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{currentAdmin?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{currentAdmin?.role || 'Administrator'}</p>
              </div>
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
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
                    <p className="text-sm font-semibold text-gray-900">{currentAdmin?.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-500">{currentAdmin?.email || 'admin@hotelmayur.com'}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      router.push('/admin/settings')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/admin/settings')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/admin/reports')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>View Reports</span>
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
    </nav>
  )
}