// src/app/api/tables/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'
import { requireAuth, handleAuthError } from '@/lib/auth'

// GET all tables
export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Build query
    const query = {}
    
    // Filter by status
    const status = searchParams.get('status')
    if (status) {
      query.status = status
    }
    
    // Filter by location
    const location = searchParams.get('location')
    if (location) {
      query.location = location
    }
    
    // Filter by floor
    const floor = searchParams.get('floor')
    if (floor) {
      query.floor = floor
    }
    
    // Filter by active status
    const isActive = searchParams.get('isActive')
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }
    
    // Sort
    const sortBy = searchParams.get('sortBy') || 'tableNumber'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1
    const sort = { [sortBy]: sortOrder }
    
    // Execute query
    const tables = await Table.find(query)
      .populate('currentSession')
      .populate('currentOrder', 'orderNumber status total')
      .sort(sort)
      .lean()
    
    return NextResponse.json(
      {
        success: true,
        data: { tables }
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get tables error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new table
export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await connectDB()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.tableNumber) {
      return NextResponse.json(
        { success: false, error: 'Table number is required' },
        { status: 400 }
      )
    }
    
    // Check if table number already exists
    const existing = await Table.findOne({ tableNumber: data.tableNumber })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Table number already exists' },
        { status: 409 }
      )
    }
    
    // Create table
    const table = await Table.create(data)
    
    // Generate QR code
    await table.generateQRCode()
    
    return NextResponse.json(
      {
        success: true,
        message: 'Table created successfully',
        data: { table }
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Create table error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}