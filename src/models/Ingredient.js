// src/models/Ingredient.js
import mongoose from 'mongoose'

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  // Category for organization
  category: {
    type: String,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Seafood', 'Spices', 'Oils', 'Beverages', 'Other'],
    default: 'Other'
  },
  // Stock management
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'g', 'L', 'ml', 'pieces', 'dozen', 'packets', 'bags', 'cans'],
    default: 'kg'
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    default: 100,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 20,
    min: 0
  },
  // Pricing
  costPerUnit: {
    type: Number,
    default: 0,
    min: 0
  },
  totalValue: {
    type: Number,
    default: 0,
    min: 0
  },
  // Supplier info
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  // Storage info
  storageLocation: {
    type: String,
    enum: ['Cold Storage', 'Dry Storage', 'Freezer', 'Pantry', 'Refrigerator'],
    default: 'Dry Storage'
  },
  // Expiry tracking
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String
  },
  // Status
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'expired'],
    default: 'in-stock'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Tracking
  lastRestocked: {
    type: Date
  },
  lastUsed: {
    type: Date
  },
  // History
  stockHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['purchase', 'usage', 'wastage', 'return', 'adjustment'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    notes: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Notes
  notes: {
    type: String
  }
}, {
  timestamps: true
})

// Indexes
ingredientSchema.index({ name: 1 })
ingredientSchema.index({ category: 1, status: 1 })
ingredientSchema.index({ status: 1 })
ingredientSchema.index({ expiryDate: 1 })

// Calculate total value before saving
ingredientSchema.pre('save', function(next) {
  this.totalValue = this.quantity * this.costPerUnit
  next()
})

// Update status based on quantity
ingredientSchema.pre('save', function(next) {
  // Check expiry
  if (this.expiryDate && new Date() > this.expiryDate) {
    this.status = 'expired'
  } else if (this.quantity <= 0) {
    this.status = 'out-of-stock'
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'low-stock'
  } else {
    this.status = 'in-stock'
  }
  next()
})

// Add stock
ingredientSchema.methods.addStock = function(quantity, type = 'purchase', notes = '', userId = null) {
  const previousStock = this.quantity
  this.quantity += quantity
  
  // Add to history
  this.stockHistory.push({
    type,
    quantity,
    previousStock,
    newStock: this.quantity,
    notes,
    recordedBy: userId
  })
  
  if (type === 'purchase') {
    this.lastRestocked = new Date()
  }
  
  return this.save()
}

// Remove stock
ingredientSchema.methods.removeStock = function(quantity, type = 'usage', notes = '', userId = null) {
  const previousStock = this.quantity
  this.quantity = Math.max(0, this.quantity - quantity)
  
  // Add to history
  this.stockHistory.push({
    type,
    quantity: -quantity,
    previousStock,
    newStock: this.quantity,
    notes,
    recordedBy: userId
  })
  
  if (type === 'usage') {
    this.lastUsed = new Date()
  }
  
  return this.save()
}

// Check if needs reorder
ingredientSchema.methods.needsReorder = function() {
  return this.quantity <= this.reorderPoint && this.status !== 'expired'
}

// Get stock percentage
ingredientSchema.virtual('stockPercentage').get(function() {
  if (this.maxStockLevel === 0) return 0
  return Math.round((this.quantity / this.maxStockLevel) * 100)
})

export default mongoose.models.Ingredient || mongoose.model('Ingredient', ingredientSchema)