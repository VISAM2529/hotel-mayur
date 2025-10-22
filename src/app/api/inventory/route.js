// src/app/api/inventory/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ingredient from '@/models/Ingredient'
import { requireAuth, handleAuthError } from '@/lib/auth'

// GET all inventory items
export async function GET(request) {
  try {
    await requireAuth(request)
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Build query
    const query = {}
    
    // Filter by category
    const category = searchParams.get('category')
    if (category) {
      query.category = category
    }
    
    // Filter by status
    const status = searchParams.get('status')
    if (status) {
      query.status = status
    }
    
    // Filter by storage location
    const storageLocation = searchParams.get('storageLocation')
    if (storageLocation) {
      query.storageLocation = storageLocation
    }
    
    // Filter by active status
    const isActive = searchParams.get('isActive')
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }
    
    // Search by name
    const search = searchParams.get('search')
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }
    
    // Filter items needing reorder
    const needsReorder = searchParams.get('needsReorder')
    if (needsReorder === 'true') {
      query.$expr = { $lte: ['$quantity', '$reorderPoint'] }
    }
    
    // Filter expiring soon (within 7 days)
    const expiringSoon = searchParams.get('expiringSoon')
    if (expiringSoon === 'true') {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      query.expiryDate = {
        $gte: new Date(),
        $lte: sevenDaysFromNow
      }
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = (page - 1) * limit
    
    // Sort
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1
    const sort = { [sortBy]: sortOrder }
    
    // Execute query
    const ingredients = await Ingredient.find(query)
      .populate('stockHistory.recordedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count
    const total = await Ingredient.countDocuments(query)
    
    // Get summary statistics
    const stats = await Ingredient.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          inStock: {
            $sum: { $cond: [{ $eq: ['$status', 'in-stock'] }, 1, 0] }
          },
          lowStock: {
            $sum: { $cond: [{ $eq: ['$status', 'low-stock'] }, 1, 0] }
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$status', 'out-of-stock'] }, 1, 0] }
          },
          expired: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          }
        }
      }
    ])
    
    return NextResponse.json(
      {
        success: true,
        data: {
          ingredients,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          stats: stats[0] || {
            totalItems: 0,
            totalValue: 0,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
            expired: 0
          }
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Get inventory error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new inventory item
export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await connectDB()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || data.quantity === undefined || !data.unit) {
      return NextResponse.json(
        { success: false, error: 'Name, quantity and unit are required' },
        { status: 400 }
      )
    }
    
    // Check if ingredient already exists
    const existingIngredient = await Ingredient.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, 'i') }
    })
    
    if (existingIngredient) {
      return NextResponse.json(
        { success: false, error: 'Ingredient with this name already exists' },
        { status: 409 }
      )
    }
    
    // Create ingredient
    const ingredient = await Ingredient.create({
      ...data,
      stockHistory: [{
        type: 'purchase',
        quantity: data.quantity,
        previousStock: 0,
        newStock: data.quantity,
        notes: 'Initial stock',
        recordedBy: user._id
      }]
    })
    
    return NextResponse.json(
      {
        success: true,
        message: 'Inventory item created successfully',
        data: { ingredient }
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Create inventory item error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}