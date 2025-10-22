'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { captains } from '@/data/captains'

const CaptainContext = createContext()

export function CaptainProvider({ children }) {
  const [currentCaptain, setCurrentCaptain] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load captain from localStorage
  useEffect(() => {
    const savedCaptain = localStorage.getItem('currentCaptain')
    if (savedCaptain) {
      try {
        const captain = JSON.parse(savedCaptain)
        setCurrentCaptain(captain)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error loading captain:', error)
        localStorage.removeItem('currentCaptain')
      }
    }
  }, [])

  const login = (username, password) => {
    const captain = captains.find(
      (c) => c.username === username && c.password === password
    )

    if (captain) {
      // Don't store password
      const { password: _, ...captainData } = captain
      setCurrentCaptain(captainData)
      setIsAuthenticated(true)
      localStorage.setItem('currentCaptain', JSON.stringify(captainData))
      return { success: true, captain: captainData }
    }

    return { success: false, error: 'Invalid username or password' }
  }

  const logout = () => {
    setCurrentCaptain(null)
    setIsAuthenticated(false)
    localStorage.removeItem('currentCaptain')
  }

  return (
    <CaptainContext.Provider
      value={{
        currentCaptain,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </CaptainContext.Provider>
  )
}

export function useCaptain() {
  const context = useContext(CaptainContext)
  if (!context) {
    throw new Error('useCaptain must be used within CaptainProvider')
  }
  return context
}