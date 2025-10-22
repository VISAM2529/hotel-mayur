// src/models/Category.js
import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: '🍽️'
  },
  image: {
    type: String // URL to category image
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For kitchen routing
  kitchenStation: {
    type: String,
    enum: ['Main Kitchen', 'Tandoor', 'Grill', 'Dessert Station', 'Beverage Station', 'All'],
    default: 'Main Kitchen'
  },
  // Timing
  availableFrom: {
    type: String, // HH:MM format
    default: '00:00'
  },
  availableTo: {
    type: String, // HH:MM format
    default: '23:59'
  },
  // Days available (0 = Sunday, 6 = Saturday)
  availableDays: {
    type: [Number],
    default: [0, 1, 2, 3, 4, 5, 6]
  }
}, {
  timestamps: true
})

// Index for quick lookups
categorySchema.index({ name: 1, isActive: 1 })
categorySchema.index({ displayOrder: 1 })

export default mongoose.models.Category || mongoose.model('Category', categorySchema)