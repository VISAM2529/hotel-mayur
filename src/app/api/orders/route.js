// src/app/api/orders/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Table from '@/models/Table'
import TableSession from '@/models/TableSession'
import MenuItem from '@/models/MenuItem'
import { requireAuth, handleAuthError } from '@/lib/auth'

// GET all orders with filters
export async function GET(request) {
  try {
    // const user = await requireAuth(request)
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    
    // Build query
    const query = {}
    
    // Filter by status (handle comma-separated values)
    const status = searchParams.get('status')
    if (status) {
      // Check if comma-separated
      if (status.includes(',')) {
        query.status = { $in: status.split(',').map(s => s.trim()) }
      } else {
        query.status = status
      }
    }
    
    // Filter by order IDs (for billing page)
    const ids = searchParams.get('ids')
    if (ids) {
      const idArray = ids.split(',').map(id => id.trim())
      query._id = { $in: idArray }
    }
    
    // Filter by table
    const tableId = searchParams.get('table')
    const tableNumber = searchParams.get('tableNumber')
    if (tableId) {
      query.table = tableId
    } else if (tableNumber) {
      query.tableNumber = parseInt(tableNumber)
    }
    
    // Filter by order type
    const orderType = searchParams.get('orderType')
    if (orderType) {
      query.orderType = orderType
    }
    
    // Filter by date range
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }
    
    // Filter by kitchen status (for KOT dashboard)
    const kitchenStatus = searchParams.get('kitchenStatus')
    if (kitchenStatus) {
      const kitchenStatuses = ['confirmed', 'preparing', 'ready']
      query.status = { $in: kitchenStatuses }
    }
    
    // Check if populate is requested
    const shouldPopulate = searchParams.get('populate') === 'true'
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = (page - 1) * limit
    
    // Sort
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1
    const sort = { [sortBy]: sortOrder }
    
    console.log('Order query:', query)
    
    // Execute query
    let ordersQuery = Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
    
    // Add population if requested
    if (shouldPopulate) {
      ordersQuery = ordersQuery
        .populate('table', 'tableNumber location type floor capacity')
        .populate('createdBy', 'name')
        .populate('servedBy', 'name')
        .populate({
          path: 'items.menuItem',
          select: 'name description price category image isVegetarian spiceLevel'
        })
    } else {
      ordersQuery = ordersQuery
        .populate('table', 'tableNumber location')
        .populate('createdBy', 'name')
        .populate('servedBy', 'name')
    }
    
    const orders = await ordersQuery.lean()
    
    // Get total count
    const total = await Order.countDocuments(query)
    
    console.log(`Found ${orders.length} orders`)
    
    return NextResponse.json(
      {
        success: true,
        data: {
          orders,
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
    
    console.error('Get orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new order
export async function POST(request) {
  try {
    // const user = await requireAuth(request)
    await connectDB()
    
    const data = await request.json()
    console.log('Order data received:', data)
    
    // Validate required fields
    if (!data.tableNumber || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Table number and items are required' },
        { status: 400 }
      )
    }
    
    // Find table
    const table = await Table.findOne({ tableNumber: data.tableNumber })
    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      )
    }
    
    // Process items and calculate prices
    const processedItems = []
    let subtotal = 0
    
    for (const item of data.items) {
      // Get menu item
      const menuItem = await MenuItem.findById(item.menuItem)
      if (!menuItem) {
        return NextResponse.json(
          { success: false, error: `Menu item ${item.menuItem} not found` },
          { status: 404 }
        )
      }
      
      if (!menuItem.isAvailable) {
        return NextResponse.json(
          { success: false, error: `${menuItem.name} is not available` },
          { status: 400 }
        )
      }
      
      // Calculate item subtotal
      let itemPrice = menuItem.price
      
      // Add customization prices
      if (item.customizations && item.customizations.length > 0) {
        item.customizations.forEach(custom => {
          custom.selectedOptions?.forEach(option => {
            itemPrice += option.price || 0
          })
        })
      }
      
      const itemSubtotal = itemPrice * item.quantity
      subtotal += itemSubtotal
      
      processedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemSubtotal,
        customizations: item.customizations || [],
        specialInstructions: item.specialInstructions || '',
        status: 'pending'
      })
      
      // Increment order count for menu item (async)
      menuItem.incrementOrders(item.quantity)
    }
    
    // Generate order number
    const orderNumber = await Order.generateOrderNumber()
    
    // Get or create session
    let session = table.currentSession
    if (!session) {
      // Create new session
      const sessionNumber = await TableSession.generateSessionNumber()
      const newSession = await TableSession.create({
        sessionNumber,
        table: table._id,
        tableNumber: table.tableNumber,
        // startedBy: user._id
      })
      session = newSession._id
      table.currentSession = session
      await table.save()
    }
    
    // Create order
    const order = new Order({
      orderNumber,
      table: table._id,
      tableNumber: table.tableNumber,
      session,
      orderType: data.orderType || 'dine-in',
      items: processedItems,
      subtotal,
      taxPercent: data.taxPercent || 5,
      serviceChargePercent: data.serviceChargePercent || 0,
      discountType: data.discountType || 'none',
      discount: data.discount || 0,
      discountReason: data.discountReason,
      notes: data.notes,
      isSupplementary: data.isSupplementary || false,
      parentOrder: data.parentOrder,
    //   createdBy: user._id,
      customer: data.customer
    })
    
    // Calculate totals
    order.calculateTotals()
    
    // Save order
    await order.save()
    
    // Update table status
    if (table.status === 'available') {
      table.status = 'occupied'
      table.lastOccupied = new Date()
    }
    table.currentOrder = order._id
    await table.save()
    
    // Add order to session
    await TableSession.findByIdAndUpdate(session, {
      $push: { orders: order._id }
    })
    
    // Populate order
    await order.populate([
      { path: 'table', select: 'tableNumber location' },
      { path: 'createdBy', select: 'name' }
    ])
    
    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: { order }
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}