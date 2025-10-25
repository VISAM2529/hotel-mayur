// src/models/Bill.js
import mongoose from 'mongoose'

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    tableNumber: {
      type: String,
      required: true,
      index: true
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      index: true
    },
    customerName: {
      type: String,
      default: 'Guest'
    },
    customerPhone: {
      type: String
    },
    items: [
      {
        id: String,
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
          required: true,
          min: 0
        },
        comments: String,
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order'
        },
        orderNumber: String
      }
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    isAC: {
      type: Boolean,
      default: false
    },
    acCharge: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'online', 'card', 'split'],
      default: 'cash'
    },
    cashAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    onlineAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    comments: {
      type: String
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['paid', 'cancelled', 'refunded'],
      default: 'paid'
    }
  },
  {
    timestamps: true
  }
)

// Indexes for better query performance
billSchema.index({ createdAt: -1 })
billSchema.index({ tableNumber: 1, createdAt: -1 })
billSchema.index({ billNumber: 1 })

// Virtual for formatted bill number
billSchema.virtual('formattedBillNumber').get(function () {
  return this.billNumber
})

// Method to calculate totals
billSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  this.acCharge = this.isAC ? this.subtotal * 0.2 : 0
  this.discountAmount = (this.subtotal + this.acCharge) * (this.discount / 100)
  this.total = this.subtotal + this.acCharge - this.discountAmount
  return this.total
}

const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema)

export default Bill