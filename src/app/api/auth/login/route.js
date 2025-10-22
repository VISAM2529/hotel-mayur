// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export async function POST(request) {
  try {
    await connectDB()
    
    const { email, password, role } = await request.json()
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide email and password' },
        { status: 400 }
      )
    }
    
    // Find user with password field
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Please contact admin.' },
        { status: 403 }
      )
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Account is temporarily locked due to multiple failed login attempts. Try again later.' },
        { status: 403 }
      )
    }
    
    // Check password
    const isPasswordCorrect = await user.comparePassword(password)
    
    if (!isPasswordCorrect) {
      // Increment login attempts
      await user.incLoginAttempts()
      
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Check role if specified
    if (role && user.role !== role) {
      return NextResponse.json(
        { success: false, error: 'Access denied for this role' },
        { status: 403 }
      )
    }
    
    // Reset login attempts on successful login
    await user.resetLoginAttempts()
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    
    // Prepare user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      specialization: user.specialization,
      permissions: user.permissions
    }
    
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          token
        }
      },
      { status: 200 }
    )
    
    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    })
    
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}