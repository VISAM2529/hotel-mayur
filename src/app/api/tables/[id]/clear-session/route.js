// src/app/api/tables/[id]/clear-session/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'
import TableSession from '@/models/TableSession'
import { requireAuth, handleAuthError } from '@/lib/auth'

// POST - Clear table session
export async function POST(request, { params }) {
  try {
    // const user = await requireAuth(request)
    await connectDB()
    
    const { id } = params
    
    // Find table
    const table = await Table.findById(id)
    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      )
    }
    
    // End current session if exists
    if (table.currentSession) {
      await TableSession.findByIdAndUpdate(
        table.currentSession,
        {
          endTime: new Date(),
          isActive: false
        }
      )
    }
    
    // Clear table
    table.currentSession = null
    table.currentOrder = null
    table.status = 'available'
    await table.save()
    
    console.log(`Session cleared for table ${table.tableNumber}`)
    
    return NextResponse.json(
      {
        success: true,
        message: 'Table session cleared successfully',
        data: { table }
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return handleAuthError(error)
    }
    
    console.error('Clear session error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}