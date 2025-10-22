'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const KitchenContext = createContext()

export function KitchenProvider({ children }) {
  const [currentStaff, setCurrentStaff] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const staffData = localStorage.getItem('kitchenStaff')
    const soundPref = localStorage.getItem('kitchenSoundEnabled')
    const refreshPref = localStorage.getItem('kitchenAutoRefresh')
    
    if (staffData) {
      setCurrentStaff(JSON.parse(staffData))
      setIsAuthenticated(true)
    }
    
    if (soundPref !== null) {
      setSoundEnabled(soundPref === 'true')
    }
    
    if (refreshPref !== null) {
      setAutoRefresh(refreshPref === 'true')
    }
  }, [])

  const login = (staffData) => {
    setCurrentStaff(staffData)
    setIsAuthenticated(true)
    localStorage.setItem('kitchenStaff', JSON.stringify(staffData))
  }

  const logout = () => {
    setCurrentStaff(null)
    setIsAuthenticated(false)
    localStorage.removeItem('kitchenStaff')
  }

  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem('kitchenSoundEnabled', newValue.toString())
  }

  const toggleAutoRefresh = () => {
    const newValue = !autoRefresh
    setAutoRefresh(newValue)
    localStorage.setItem('kitchenAutoRefresh', newValue.toString())
  }

  const playNotificationSound = () => {
    if (soundEnabled) {
      // Simple beep sound using Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  return (
    <KitchenContext.Provider
      value={{
        currentStaff,
        isAuthenticated,
        soundEnabled,
        autoRefresh,
        login,
        logout,
        toggleSound,
        toggleAutoRefresh,
        playNotificationSound
      }}
    >
      {children}
    </KitchenContext.Provider>
  )
}

export function useKitchen() {
  const context = useContext(KitchenContext)
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider')
  }
  return context
}