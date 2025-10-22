// src/app/api/inventory/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ingredient from '@/models/Ingredient'
import { requireAuth, handleAuthError } from '@/lib/auth'

// GET single inventory item
export async function GET(request, { params }) {
  try {
    await requireAuth(request)
    await connectDB()
    
    const ingredient = await Ingredient.findById(params.id)
      .populate('stockHistory.recordedBy', 'name role')
      .lean()
    
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        data: { ingredient }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Get inventory item error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update inventory item
export async function PUT(request, { params }) {
  try {
    await requireAuth(request)
    await connectDB()
    
    const data = await request.json()
    
    const ingredient = await Ingredient.findById(params.id)
    
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      )
    }
    
    // If name is being updated, check for duplicates
    if (data.name && data.name !== ingredient.name) {
      const existingIngredient = await Ingredient.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
        _id: { $ne: params.id }
      })
      
      if (existingIngredient) {
        return NextResponse.json(
          { success: false, error: 'Ingredient with this name already exists' },
          { status: 409 }
        )
      }
    }
    
    // Update fields
    Object.keys(data).forEach(key => {
      if (key !== 'stockHistory' && key !== '_id') {
        ingredient[key] = data[key]
      }
    })
    
    await ingredient.save()
    
    return NextResponse.json(
      {
        success: true,
        message: 'Inventory item updated successfully',
        data: { ingredient }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Update inventory item error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE inventory item
export async function DELETE(request, { params }) {
  try {
    await requireAuth(request)
    await connectDB()
    
    const ingredient = await Ingredient.findByIdAndDelete(params.id)
    
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Inventory item deleted successfully'
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Delete inventory item error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}