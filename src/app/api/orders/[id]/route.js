// src/app/api/orders/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth, handleAuthError } from '@/lib/auth'

// GET single order
export async function GET(request, { params }) {
  try {
    await requireAuth(request)
    await connectDB()
    
    const order = await Order.findById(params.id)
      .populate('table', 'tableNumber location floor')
      .populate('session')
      .populate('createdBy', 'name role')
      .populate('servedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('items.menuItem', 'name image category')
      .lean()
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        data: { order }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Get order error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update order
export async function PUT(request, { params }) {
  try {
    const user = await requireAuth(request)
    await connectDB()
    
    const data = await request.json()
    
    const order = await Order.findById(params.id)
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Update allowed fields
    const allowedUpdates = ['notes', 'discount', 'discountType', 'discountReason']
    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        order[field] = data[field]
      }
    })
    
    // Recalculate totals if discount changed
    if (data.discount !== undefined || data.discountType !== undefined) {
      order.calculateTotals()
    }
    
    await order.save()
    
    await order.populate([
      { path: 'table', select: 'tableNumber location' },
      { path: 'createdBy', select: 'name' },
      { path: 'servedBy', select: 'name' }
    ])
    
    return NextResponse.json(
      {
        success: true,
        message: 'Order updated successfully',
        data: { order }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Update order error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE order (cancel)
export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request)
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')
    
    const order = await Order.findById(params.id)
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: 'Can only cancel pending or confirmed orders' },
        { status: 400 }
      )
    }
    
    // Update order status to cancelled
    await order.changeStatus('cancelled', user._id)
    order.cancellationReason = reason || 'Cancelled by staff'
    await order.save()
    
    return NextResponse.json(
      {
        success: true,
        message: 'Order cancelled successfully'
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Cancel order error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}