// src/models/TableSession.js
import mongoose from 'mongoose'

const tableSessionSchema = new mongoose.Schema({
  sessionNumber: {
    type: String,
    required: true,
    unique: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  tableNumber: {
    type: Number,
    required: true
  },
  // Session status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  // Customer info
  numberOfGuests: {
    type: Number,
    default: 1,
    min: 1
  },
  customer: {
    name: String,
    phone: String,
    email: String
  },
  // Orders in this session
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  // Billing
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  serviceCharge: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'split'],
    default: 'cash'
  },
  // Timestamps
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  // Staff
  startedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Notes
  notes: String,
  // Rating
  rating: {
    overall: { type: Number, min: 1, max: 5 },
    food: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    ambiance: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: Date
  }
}, {
  timestamps: true
})

// Indexes
tableSessionSchema.index({ table: 1, status: 1 })
tableSessionSchema.index({ sessionNumber: 1 })
tableSessionSchema.index({ status: 1, createdAt: -1 })

// Generate session number
tableSessionSchema.statics.generateSessionNumber = async function() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  const startOfDay = new Date(date.setHours(0, 0, 0, 0))
  const count = await this.countDocuments({
    createdAt: { $gte: startOfDay }
  })
  
  const sessionNum = (count + 1).toString().padStart(4, '0')
  return `SES${year}${month}${day}${sessionNum}`
}

// Calculate session totals
tableSessionSchema.methods.calculateTotals = async function() {
  await this.populate('orders')
  
  this.subtotal = this.orders.reduce((sum, order) => sum + order.subtotal, 0)
  this.tax = this.orders.reduce((sum, order) => sum + order.tax, 0)
  this.serviceCharge = this.orders.reduce((sum, order) => sum + order.serviceCharge, 0)
  this.discount = this.orders.reduce((sum, order) => sum + order.discount, 0)
  this.total = this.orders.reduce((sum, order) => sum + order.total, 0)
  
  return this.save()
}

// Close session
tableSessionSchema.methods.closeSession = async function(userId) {
  this.status = 'completed'
  this.endTime = new Date()
  this.closedBy = userId
  
  // Calculate duration in minutes
  this.duration = Math.round((this.endTime - this.startTime) / 1000 / 60)
  
  return this.save()
}

export default mongoose.models.TableSession || mongoose.model('TableSession', tableSessionSchema)