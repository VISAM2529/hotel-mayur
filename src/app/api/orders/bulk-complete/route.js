// src/app/api/orders/bulk-complete/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth, handleAuthError } from '@/lib/auth'

// PUT - Complete multiple orders
export async function PUT(request) {
  try {
    // const user = await requireAuth(request)
    await connectDB()
    
    const { orderIds, status } = await request.json()
    
    // Validate
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order IDs are required' },
        { status: 400 }
      )
    }
    
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }
    
    // Update all orders
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        $set: { 
          status: status,
          completedAt: status === 'completed' ? new Date() : undefined
        } 
      }
    )
    
    console.log(`Updated ${result.modifiedCount} orders to ${status}`)
    
    return NextResponse.json(
      {
        success: true,
        message: `${result.modifiedCount} orders updated to ${status}`,
        data: {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Bulk complete orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}