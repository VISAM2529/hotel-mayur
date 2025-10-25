'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('adminToken')
      const adminData = localStorage.getItem('adminUser')

      if (token && adminData) {
        setCurrentAdmin(JSON.parse(adminData))
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (result.success && result.data) {
        const { token, user } = result.data

        // Validate that user is admin
        if (user.role !== 'admin') {
          return {
            success: false,
            error: 'Access denied. Admin credentials required.'
          }
        }

        // Store token and user data
        localStorage.setItem('adminToken', token)
        localStorage.setItem('adminUser', JSON.stringify(user))

        // Update state
        setCurrentAdmin(user)
        setIsAuthenticated(true)

        return {
          success: true,
          user: user
        }
      } else {
        return {
          success: false,
          error: result.error || 'Invalid credentials'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  const logout = () => {
    // Clear storage
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')

    // Clear state
    setCurrentAdmin(null)
    setIsAuthenticated(false)
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // Wrapper for authenticated API calls
  const adminFetch = async (url, options = {}) => {
    const token = localStorage.getItem('adminToken')

    if (!token) {
      logout()
      throw new Error('Not authenticated')
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      // Handle 401 Unauthorized
      if (response.status === 401) {
        logout()
        window.location.href = '/admin/login'
        throw new Error('Session expired')
      }

      return response
    } catch (error) {
      console.error('API call error:', error)
      throw error
    }
  }

  const value = {
    currentAdmin,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeaders,
    adminFetch
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}