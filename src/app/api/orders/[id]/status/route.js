// src/app/api/orders/[id]/status/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Table from '@/models/Table'
import { requireAuth, handleAuthError } from '@/lib/auth'

// PUT - Update order status
export async function PUT(request, { params }) {
  try {
    const user = await requireAuth(request)
    await connectDB()
    
    const { status } = await request.json()
    
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    const order = await Order.findById(params.id)
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Change status
    await order.changeStatus(status, user._id)
    
    // If order is completed, update table status
    // if (status === 'completed' || status === 'served') {
    //   const table = await Table.findById(order.table)
    //   if (table && table.currentOrder?.toString() === order._id.toString()) {
    //     // Check if there are more orders for this table
    //     const pendingOrders = await Order.countDocuments({
    //       table: table._id,
    //       status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    //     })
        
    //     if (pendingOrders === 0) {
    //       // No more pending orders, table can be marked as available after payment
    //       table.currentOrder = null
    //     }
    //   }
    // }
    
    await order.populate([
      { path: 'table', select: 'tableNumber location' },
      { path: 'createdBy', select: 'name' },
      { path: 'servedBy', select: 'name' }
    ])
    
    return NextResponse.json(
      {
        success: true,
        message: `Order status updated to ${status}`,
        data: { order }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Update order status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}