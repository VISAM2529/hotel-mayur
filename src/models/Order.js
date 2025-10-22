// src/models/Order.js
import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  // Customizations selected
  customizations: [{
    name: String,
    selectedOptions: [{
      name: String,
      price: Number
    }]
  }],
  specialInstructions: {
    type: String,
    trim: true
  },
  // Kitchen tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served'],
    default: 'pending'
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  preparedAt: Date,
  servedAt: Date
})

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  // Table info
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  tableNumber: {
    type: Number,
    required: true
  },
  // Session
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TableSession'
  },
  // Order type
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'dine-in'
  },
  // Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  taxPercent: {
    type: Number,
    default: 5, // 5% GST
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none'
  },
  discountReason: String,
  serviceCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  serviceChargePercent: {
    type: Number,
    default: 0,
    min: 0
  },
  deliveryCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  
  // Customer info (optional for walk-ins)
  customer: {
    name: String,
    phone: String,
    email: String
  },
  
  // Special requests
  notes: {
    type: String,
    trim: true
  },
  
  // KOT info
  isSupplementary: {
    type: Boolean,
    default: false
  },
  parentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  kotPrintCount: {
    type: Number,
    default: 0
  },
  kotPrintedAt: Date,
  
  // Staff tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  servedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  confirmedAt: Date,
  preparingAt: Date,
  readyAt: Date,
  servedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Delivery info (if delivery order)
  delivery: {
    address: String,
    city: String,
    zipCode: String,
    instructions: String,
    deliveryTime: Date,
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Rating & feedback
  rating: {
    food: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    overall: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: Date
  }
}, {
  timestamps: true
})

// Indexes for performance
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ table: 1, status: 1 })
orderSchema.index({ status: 1, createdAt: -1 })
orderSchema.index({ tableNumber: 1, createdAt: -1 })
orderSchema.index({ createdAt: -1 })

// Generate order number
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  // Count today's orders
  const startOfDay = new Date(date.setHours(0, 0, 0, 0))
  const count = await this.countDocuments({
    createdAt: { $gte: startOfDay }
  })
  
  const orderNum = (count + 1).toString().padStart(4, '0')
  return `ORD${year}${month}${day}${orderNum}`
}

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0)
  
  // Calculate tax
  this.tax = (this.subtotal * this.taxPercent) / 100
  
  // Calculate service charge
  if (this.serviceChargePercent > 0) {
    this.serviceCharge = (this.subtotal * this.serviceChargePercent) / 100
  }
  
  // Calculate discount
  let discountAmount = 0
  if (this.discountType === 'percentage') {
    discountAmount = (this.subtotal * this.discount) / 100
  } else if (this.discountType === 'fixed') {
    discountAmount = this.discount
  }
  
  // Calculate total
  this.total = this.subtotal + this.tax + this.serviceCharge + this.deliveryCharge - discountAmount
  this.total = Math.round(this.total * 100) / 100 // Round to 2 decimals
  
  return this
}

// Change order status
orderSchema.methods.changeStatus = async function(newStatus, userId) {
  this.status = newStatus
  
  const now = new Date()
  
  switch(newStatus) {
    case 'confirmed':
      this.confirmedAt = now
      this.approvedBy = userId
      // Update all items to confirmed
      this.items.forEach(item => {
        if (item.status === 'pending') {
          item.status = 'confirmed'
        }
      })
      break
    case 'preparing':
      this.preparingAt = now
      break
    case 'ready':
      this.readyAt = now
      break
    case 'served':
      this.servedAt = now
      this.servedBy = userId
      break
    case 'completed':
      this.completedAt = now
      break
    case 'cancelled':
      this.cancelledAt = now
      this.cancelledBy = userId
      break
  }
  
  return this.save()
}

// Mark item as prepared
orderSchema.methods.markItemPrepared = function(itemId, userId) {
  const item = this.items.id(itemId)
  if (item) {
    item.status = 'ready'
    item.preparedBy = userId
    item.preparedAt = new Date()
  }
  
  // Check if all items are ready
  const allReady = this.items.every(item => item.status === 'ready' || item.status === 'served')
  if (allReady && this.status !== 'ready') {
    this.status = 'ready'
    this.readyAt = new Date()
  }
  
  return this.save()
}

// Print KOT
orderSchema.methods.printKOT = function() {
  this.kotPrintCount += 1
  this.kotPrintedAt = new Date()
  return this.save()
}

export default mongoose.models.Order || mongoose.model('Order', orderSchema)