// src/app/api/inventory/alerts/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ingredient from '@/models/Ingredient'
import { requireAuth, handleAuthError } from '@/lib/auth'

// GET inventory alerts
export async function GET(request) {
  try {
    await requireAuth(request)
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const alertType = searchParams.get('type') || 'all' // all, low-stock, out-of-stock, expiring, expired
    
    const alerts = {
      lowStock: [],
      outOfStock: [],
      expiring: [],
      expired: [],
      needsReorder: []
    }
    
    // Get low stock items
    if (alertType === 'all' || alertType === 'low-stock') {
      alerts.lowStock = await Ingredient.find({
        status: 'low-stock',
        isActive: true
      })
      .select('name quantity unit minStockLevel status category storageLocation')
      .sort({ quantity: 1 })
      .lean()
    }
    
    // Get out of stock items
    if (alertType === 'all' || alertType === 'out-of-stock') {
      alerts.outOfStock = await Ingredient.find({
        status: 'out-of-stock',
        isActive: true
      })
      .select('name quantity unit status category storageLocation')
      .sort({ name: 1 })
      .lean()
    }
    
    // Get expiring items (within 7 days)
    if (alertType === 'all' || alertType === 'expiring') {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      
      alerts.expiring = await Ingredient.find({
        expiryDate: {
          $gte: new Date(),
          $lte: sevenDaysFromNow
        },
        status: { $ne: 'expired' },
        isActive: true
      })
      .select('name quantity unit expiryDate batchNumber status category storageLocation')
      .sort({ expiryDate: 1 })
      .lean()
    }
    
    // Get expired items
    if (alertType === 'all' || alertType === 'expired') {
      alerts.expired = await Ingredient.find({
        status: 'expired',
        isActive: true
      })
      .select('name quantity unit expiryDate batchNumber status category storageLocation')
      .sort({ expiryDate: 1 })
      .lean()
    }
    
    // Get items needing reorder
    if (alertType === 'all' || alertType === 'reorder') {
      alerts.needsReorder = await Ingredient.find({
        $expr: { $lte: ['$quantity', '$reorderPoint'] },
        status: { $ne: 'expired' },
        isActive: true
      })
      .select('name quantity unit reorderPoint supplier status category')
      .sort({ quantity: 1 })
      .lean()
    }
    
    // Calculate alert counts
    const alertCounts = {
      lowStock: alerts.lowStock.length,
      outOfStock: alerts.outOfStock.length,
      expiring: alerts.expiring.length,
      expired: alerts.expired.length,
      needsReorder: alerts.needsReorder.length,
      total: alerts.lowStock.length + alerts.outOfStock.length + 
             alerts.expiring.length + alerts.expired.length + alerts.needsReorder.length
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          alerts,
          counts: alertCounts
        }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Get inventory alerts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}