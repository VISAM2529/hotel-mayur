// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
  try {
    await connectDB()
    
    const { name, email, password, role, phone, specialization } = await request.json()
    
    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide name, email and password' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Set permissions based on role
    let permissions = {
      canManageMenu: false,
      canManageOrders: false,
      canManageTables: false,
      canManageUsers: false,
      canViewReports: false,
      canManageBilling: false
    }
    
    if (role === 'admin') {
      permissions = {
        canManageMenu: true,
        canManageOrders: true,
        canManageTables: true,
        canManageUsers: true,
        canViewReports: true,
        canManageBilling: true
      }
    } else if (role === 'manager') {
      permissions = {
        canManageMenu: true,
        canManageOrders: true,
        canManageTables: true,
        canManageUsers: false,
        canViewReports: true,
        canManageBilling: true
      }
    } else if (role === 'captain' || role === 'waiter') {
      permissions = {
        canManageMenu: false,
        canManageOrders: true,
        canManageTables: true,
        canManageUsers: false,
        canViewReports: false,
        canManageBilling: true
      }
    } else if (role === 'chef' || role === 'kitchen_staff') {
      permissions = {
        canManageMenu: false,
        canManageOrders: true,
        canManageTables: false,
        canManageUsers: false,
        canViewReports: false,
        canManageBilling: false
      }
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'waiter',
      phone,
      specialization,
      permissions
    })
    
    // Return user data (without password)
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
    
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: { user: userData }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}