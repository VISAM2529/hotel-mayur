// src/app/api/bills/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Bill from '@/models/Bill'
import { requireAuth, handleAuthError } from '@/lib/auth'

// GET - Get all bills with filters
export async function GET(request) {
  try {
    // const user = await requireAuth(request)
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Build query
    const query = {}
    
    // Filter by table
    const tableNumber = searchParams.get('tableNumber')
    if (tableNumber) {
      query.tableNumber = tableNumber
    }
    
    // Filter by date range
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = (page - 1) * limit
    
    // Sort
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1
    const sort = { [sortBy]: sortOrder }
    
    // Execute query
    const bills = await Bill.find(query)
      .populate('tableId', 'tableNumber location')
      .populate('orders', 'orderNumber status')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count
    const total = await Bill.countDocuments(query)
    
    return NextResponse.json(
      {
        success: true,
        data: {
          bills,
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
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Get bills error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new bill
export async function POST(request) {
  try {
    // const user = await requireAuth(request)
    await connectDB()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.billNumber || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bill number and items are required' },
        { status: 400 }
      )
    }
    
    // Parse date - handle both ISO string and Date object
    let billDate
    if (data.date) {
      billDate = new Date(data.date)
      if (isNaN(billDate.getTime())) {
        // Invalid date, use current date
        billDate = new Date()
      }
    } else {
      billDate = new Date()
    }
    
    // Create bill
    const bill = await Bill.create({
      billNumber: data.billNumber,
      date: billDate,
      tableNumber: data.tableNumber,
      tableId: data.tableId,
      customerName: data.customerName || 'Guest',
      customerPhone: data.customerPhone,
      items: data.items,
      subtotal: data.subtotal,
      isAC: data.isAC || false,
      acCharge: data.acCharge || 0,
      discount: data.discount || 0,
      discountAmount: data.discountAmount || 0,
      total: data.total,
      paymentMode: data.paymentMode,
      cashAmount: data.cashAmount || 0,
      onlineAmount: data.onlineAmount || 0,
      comments: data.comments,
      orders: data.orders || [],
      // createdBy: user._id
    })
    
    console.log(`Bill ${bill.billNumber} created for table ${bill.tableNumber}`)
    
    return NextResponse.json(
      {
        success: true,
        message: 'Bill created successfully',
        data: { bill }
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Create bill error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}