// src/app/api/categories/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import MenuItem from '@/models/MenuItem'
import { requirePermission, handleAuthError } from '@/lib/auth'

// GET single category
export async function GET(request, { params }) {
  try {
    await connectDB()
    
    const category = await Category.findById(params.id).lean()
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Get item count for this category
    const itemCount = await MenuItem.countDocuments({
      category: category._id,
      isAvailable: true
    })
    
    category.itemCount = itemCount
    
    return NextResponse.json(
      {
        success: true,
        data: { category }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update category
export async function PUT(request, { params }) {
  try {
    // Check permissions
    await requirePermission(request, 'canManageMenu')
    
    await connectDB()
    
    const data = await request.json()
    
    // Check if category exists
    const category = await Category.findById(params.id)
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // If name is being updated, check for duplicates
    if (data.name && data.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
        _id: { $ne: params.id }
      })
      
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'Category with this name already exists' },
          { status: 409 }
        )
      }
    }
    
    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    )
    
    return NextResponse.json(
      {
        success: true,
        message: 'Category updated successfully',
        data: { category: updatedCategory }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Update category error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(request, { params }) {
  try {
    // Check permissions
    await requirePermission(request, 'canManageMenu')
    
    await connectDB()
    
    const category = await Category.findById(params.id)
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Check if category has menu items
    const itemCount = await MenuItem.countDocuments({ category: params.id })
    
    if (itemCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category. It has ${itemCount} menu items. Please move or delete the items first.` 
        },
        { status: 400 }
      )
    }
    
    await Category.findByIdAndDelete(params.id)
    
    return NextResponse.json(
      {
        success: true,
        message: 'Category deleted successfully'
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Delete category error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}