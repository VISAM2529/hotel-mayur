// src/app/api/categories/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { requirePermission, handleAuthError } from '@/lib/auth'

// GET all categories
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Build query
    const query = {}
    
    // Filter by active status
    const isActive = searchParams.get('isActive')
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }
    
    // Filter by kitchen station
    const kitchenStation = searchParams.get('kitchenStation')
    if (kitchenStation) {
      query.kitchenStation = kitchenStation
    }
    
    // Check if category is available now (based on time and day)
    const checkAvailability = searchParams.get('checkAvailability')
    
    // Sort
    const sortBy = searchParams.get('sortBy') || 'displayOrder'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1
    const sort = { [sortBy]: sortOrder }
    
    // Execute query
    let categories = await Category.find(query)
      .sort(sort)
      .lean()
    
    // Filter by availability if requested
    if (checkAvailability === 'true') {
      const now = new Date()
      const currentDay = now.getDay() // 0 = Sunday, 6 = Saturday
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      categories = categories.filter(category => {
        // Check if available on current day
        if (!category.availableDays.includes(currentDay)) {
          return false
        }
        
        // Check if available at current time
        if (category.availableFrom && category.availableTo) {
          return currentTime >= category.availableFrom && currentTime <= category.availableTo
        }
        
        return true
      })
    }
    
    // Count items in each category (optional)
    const includeItemCount = searchParams.get('includeItemCount')
    if (includeItemCount === 'true') {
      const MenuItem = (await import('@/models/MenuItem')).default
      
      for (let category of categories) {
        const itemCount = await MenuItem.countDocuments({
          category: category._id,
          isAvailable: true
        })
        category.itemCount = itemCount
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        data: { categories }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    // Check permissions
    await requirePermission(request, 'canManageMenu')
    
    await connectDB()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }
    
    // Check if category name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${data.name}$`, 'i') } 
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      )
    }
    
    // Set display order if not provided
    if (!data.displayOrder && data.displayOrder !== 0) {
      const maxOrder = await Category.findOne().sort({ displayOrder: -1 }).select('displayOrder')
      data.displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0
    }
    
    // Create category
    const category = await Category.create(data)
    
    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        data: { category }
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Create category error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}