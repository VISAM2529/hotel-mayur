'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCaptain } from '@/context/CaptainContext'
import toast from 'react-hot-toast'

export default function CaptainNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentCaptain, logout } = useCaptain()

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      toast.success('Logged out successfully')
      router.push('/captain/login')
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/captain/dashboard', icon: '📊' },
    { name: 'Pending Orders', path: '/captain/orders/pending', icon: '⏳' },
    { name: 'Active Orders', path: '/captain/orders/active', icon: '🔥' },
    { name: 'Tables', path: '/captain/tables', icon: '🪑' },
    { name: 'Incentives', path: '/captain/incentives', icon: '💰' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Captain Name */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-lg font-bold text-gray-900">Hotel Mayur</p>
                <p className="text-xs text-gray-600">Captain Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  pathname === item.path
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900">{currentCaptain?.name}</p>
              <p className="text-xs text-gray-600">{currentCaptain?.id}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors border border-red-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex overflow-x-auto space-x-2 pb-3 scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                pathname === item.path
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span className="mr-1.5">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}