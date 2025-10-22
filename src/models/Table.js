// src/models/Table.js
import mongoose from 'mongoose'

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Table number is required'],
    unique: true,
    min: 1
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1,
    default: 4
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'terrace', 'garden', 'vip'],
    default: 'indoor'
  },
  floor: {
    type: String,
    default: 'Ground Floor'
  },
  section: {
    type: String, // e.g., 'A', 'B', 'C'
    default: 'A'
  },
  // QR Code
  qrCode: {
    type: String, // QR code data/URL
    unique: true
  },
  qrCodeUrl: {
    type: String // URL to QR code image
  },
  // Current session
  currentSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TableSession'
  },
  // Current order
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  // Features
  features: [{
    type: String,
    enum: ['Window View', 'Near Kitchen', 'Private', 'High Chair Available', 'Wheelchair Accessible']
  }],
  // Availability
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: true // Can accept online orders
  },
  // Last activity
  lastOccupied: {
    type: Date
  },
  lastCleaned: {
    type: Date
  },
  // Stats
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  // Notes
  notes: {
    type: String
  }
}, {
  timestamps: true
})

// Indexes
tableSchema.index({ tableNumber: 1 })
tableSchema.index({ status: 1, isActive: 1 })
tableSchema.index({ location: 1, floor: 1 })

// Generate QR Code data
tableSchema.methods.generateQRCode = function() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  this.qrCode = `${baseUrl}/order/${this.tableNumber}`
  return this.save()
}

// Change table status
tableSchema.methods.changeStatus = function(newStatus) {
  this.status = newStatus
  if (newStatus === 'occupied') {
    this.lastOccupied = new Date()
  }
  if (newStatus === 'available') {
    this.currentSession = null
    this.currentOrder = null
  }
  return this.save()
}

// Mark as cleaned
tableSchema.methods.markCleaned = function() {
  this.lastCleaned = new Date()
  this.status = 'available'
  return this.save()
}

export default mongoose.models.Table || mongoose.model('Table', tableSchema)