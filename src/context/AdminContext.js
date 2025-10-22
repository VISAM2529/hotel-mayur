'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { admins } from '@/data/admins'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load admin from localStorage
  useEffect(() => {
    const savedAdmin = localStorage.getItem('currentAdmin')
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin)
        setCurrentAdmin(admin)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error loading admin:', error)
        localStorage.removeItem('currentAdmin')
      }
    }
  }, [])

  const login = (username, password) => {
    const admin = admins.find(
      (a) => a.username === username && a.password === password
    )

    if (admin) {
      // Don't store password
      const { password: _, ...adminData } = admin
      setCurrentAdmin(adminData)
      setIsAuthenticated(true)
      localStorage.setItem('currentAdmin', JSON.stringify(adminData))
      return { success: true, admin: adminData }
    }

    return { success: false, error: 'Invalid username or password' }
  }

  const logout = () => {
    setCurrentAdmin(null)
    setIsAuthenticated(false)
    localStorage.removeItem('currentAdmin')
  }

  const hasPermission = (permission) => {
    if (!currentAdmin) return false
    return currentAdmin.permissions.includes('all') || 
           currentAdmin.permissions.includes(permission)
  }

  return (
    <AdminContext.Provider
      value={{
        currentAdmin,
        isAuthenticated,
        login,
        logout,
        hasPermission,
      }}
    >
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