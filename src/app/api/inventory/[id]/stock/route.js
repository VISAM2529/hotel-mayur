// src/app/api/inventory/[id]/stock/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ingredient from '@/models/Ingredient'
import { requireAuth, handleAuthError } from '@/lib/auth'

// PUT - Update stock (add or remove)
export async function PUT(request, { params }) {
  try {
    const user = await requireAuth(request)
    await connectDB()
    
    const { action, quantity, type, notes } = await request.json()
    
    // Validate input
    if (!action || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Action and valid quantity are required' },
        { status: 400 }
      )
    }
    
    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be either "add" or "remove"' },
        { status: 400 }
      )
    }
    
    const ingredient = await Ingredient.findById(params.id)
    
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      )
    }
    
    // Perform stock update
    if (action === 'add') {
      const stockType = type || 'purchase'
      await ingredient.addStock(quantity, stockType, notes || '', user._id)
    } else if (action === 'remove') {
      const stockType = type || 'usage'
      
      // Check if enough stock available
      if (ingredient.quantity < quantity) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Insufficient stock. Available: ${ingredient.quantity} ${ingredient.unit}` 
          },
          { status: 400 }
        )
      }
      
      await ingredient.removeStock(quantity, stockType, notes || '', user._id)
    }
    
    // Populate the updated ingredient
    await ingredient.populate('stockHistory.recordedBy', 'name')
    
    return NextResponse.json(
      {
        success: true,
        message: `Stock ${action === 'add' ? 'added' : 'removed'} successfully`,
        data: { ingredient }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Update stock error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get stock history for an item
export async function GET(request, { params }) {
  try {
    await requireAuth(request)
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Pagination for history
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    
    const ingredient = await Ingredient.findById(params.id)
      .populate('stockHistory.recordedBy', 'name role')
      .lean()
    
    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      )
    }
    
    // Sort history by date (newest first)
    const sortedHistory = ingredient.stockHistory.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
    
    // Paginate history
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedHistory = sortedHistory.slice(startIndex, endIndex)
    
    return NextResponse.json(
      {
        success: true,
        data: {
          ingredient: {
            _id: ingredient._id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            status: ingredient.status
          },
          history: paginatedHistory,
          pagination: {
            page,
            limit,
            total: sortedHistory.length,
            pages: Math.ceil(sortedHistory.length / limit)
          }
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Get stock history error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}