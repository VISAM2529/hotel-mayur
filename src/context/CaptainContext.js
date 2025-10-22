'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CaptainContext = createContext()

export function CaptainProvider({ children }) {
  const [currentCaptain, setCurrentCaptain] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load captain from localStorage on mount
  useEffect(() => {
    const loadCaptain = () => {
      try {
        const token = localStorage.getItem('authToken')
        const user = localStorage.getItem('user')

        if (token && user) {
          const userData = JSON.parse(user)
          
          // Only set if user is a captain
          if (userData.role === 'captain') {
            setCurrentCaptain(userData)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Error loading captain:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    loadCaptain()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success) {
        const { token, user } = result.data

        // Verify user is a captain
        if (user.role !== 'captain') {
          return { 
            success: false, 
            error: 'This login is only for Captains. Please use the correct login page.' 
          }
        }

        // Save to localStorage
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))

        // Update state
        setCurrentCaptain(user)
        setIsAuthenticated(true)

        return { success: true, captain: user }
      } else {
        return { success: false, error: result.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Failed to login. Please try again.' }
    }
  }

  const logout = () => {
    setCurrentCaptain(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // Make authenticated API call
  const captainFetch = async (url, options = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // If unauthorized, logout
    if (response.status === 401) {
      logout()
      throw new Error('Unauthorized')
    }

    return response
  }

  const value = {
    currentCaptain,
    isAuthenticated,
    loading,
    login,
    logout,
    getAuthHeaders,
    captainFetch,
  }

  return <CaptainContext.Provider value={value}>{children}</CaptainContext.Provider>
}

export function useCaptain() {
  const context = useContext(CaptainContext)
  if (!context) {
    throw new Error('useCaptain must be used within CaptainProvider')
  }
  return context
}