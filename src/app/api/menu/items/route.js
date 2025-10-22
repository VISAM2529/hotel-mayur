// src/app/api/menu/items/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MenuItem from '@/models/MenuItem'
import Category from '@/models/Category'
import { requirePermission, handleAuthError } from '@/lib/auth'

// GET all menu items with filters
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Build query
    const query = {}
    
    // Filter by category
    const categoryId = searchParams.get('category')
    if (categoryId) {
      query.category = categoryId
    }
    
    // Filter by availability
    const isAvailable = searchParams.get('isAvailable')
    if (isAvailable !== null && isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true'
    }
    
    // Filter by vegetarian
    const isVegetarian = searchParams.get('isVegetarian')
    if (isVegetarian !== null) {
      query.isVegetarian = isVegetarian === 'true'
    }
    
    // Filter by popular
    const isPopular = searchParams.get('isPopular')
    if (isPopular !== null) {
      query.isPopular = isPopular === 'true'
    }
    
    // Search by name/description
    const search = searchParams.get('search')
    if (search) {
      query.$text = { $search: search }
    }
    
    // Price range
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = (page - 1) * limit
    
    // Sort
    let sort = {}
    const sortBy = searchParams.get('sortBy') || 'displayOrder'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1
    sort[sortBy] = sortOrder
    
    // Execute query
    const items = await MenuItem.find(query)
      .populate('category', 'name icon')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count
    const total = await MenuItem.countDocuments(query)
    
    return NextResponse.json(
      {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get menu items error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new menu item
export async function POST(request) {
  try {
    // Check permissions
    const user = await requirePermission(request, 'canManageMenu')
    
    await connectDB()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.category || data.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, category and price are required' },
        { status: 400 }
      )
    }
    
    // Check if category exists
    const category = await Category.findById(data.category)
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Create menu item
    const menuItem = await MenuItem.create(data)
    
    // Populate category
    await menuItem.populate('category', 'name icon')
    
    return NextResponse.json(
      {
        success: true,
        message: 'Menu item created successfully',
        data: { item: menuItem }
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Create menu item error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}