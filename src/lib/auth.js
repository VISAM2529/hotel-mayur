// src/lib/auth.js
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import connectDB from './mongodb'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

/**
 * Authenticate user from request
 * Returns user object if authenticated, null otherwise
 */
export async function authenticateUser(request) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return null
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Connect to DB and get user
    await connectDB()
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user || !user.isActive) {
      return null
    }
    
    return user
    
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Middleware to require authentication
 * Usage: const user = await requireAuth(request)
 */
export async function requireAuth(request) {
  const user = await authenticateUser(request)
  
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  
  return user
}

/**
 * Middleware to require specific role
 * Usage: await requireRole(request, ['admin', 'manager'])
 */
export async function requireRole(request, allowedRoles = []) {
  const user = await requireAuth(request)
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN')
  }
  
  return user
}

/**
 * Middleware to require specific permission
 * Usage: await requirePermission(request, 'canManageMenu')
 */
export async function requirePermission(request, permission) {
  const user = await requireAuth(request)
  
  if (!user.permissions || !user.permissions[permission]) {
    throw new Error('FORBIDDEN')
  }
  
  return user
}

/**
 * Error handler for auth middleware
 */
export function handleAuthError(error) {
  if (error.message === 'UNAUTHORIZED') {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  if (error.message === 'FORBIDDEN') {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  console.error('Auth error:', error)
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}

/**
 * Generate JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}