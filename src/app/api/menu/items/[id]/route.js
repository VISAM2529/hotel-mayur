// src/app/api/menu/items/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MenuItem from '@/models/MenuItem'
import { requirePermission, handleAuthError } from '@/lib/auth'

// GET single menu item
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const item = await MenuItem.findById(params.id)
      .populate('category', 'name icon kitchenStation')
      .lean()
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }
    
    // Increment view count (async, don't wait)
    MenuItem.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } }).exec()
    
    return NextResponse.json(
      {
        success: true,
        data: { item }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get menu item error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update menu item
export async function PUT(request, { params }) {
  try {
    // Check permissions
    await requirePermission(request, 'canManageMenu')
    
    await connectDB()
    
    const data = await request.json()
    
    // Find and update
    const item = await MenuItem.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('category', 'name icon')
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Menu item updated successfully',
        data: { item }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Update menu item error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE menu item
export async function DELETE(request, { params }) {
  try {
    // Check permissions
    await requirePermission(request, 'canManageMenu')
    
    await connectDB()
    
    const item = await MenuItem.findByIdAndDelete(params.id)
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Menu item deleted successfully'
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Delete menu item error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}