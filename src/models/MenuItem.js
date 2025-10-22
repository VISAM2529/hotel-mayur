// src/models/MenuItem.js
import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  originalPrice: {
    type: Number, // For showing discounts
    min: 0
  },
  image: {
    type: String, // URL to item image
    default: '/images/default-food.jpg'
  },
  images: [{
    type: String // Multiple images
  }],
  // Item properties
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'],
    default: 'Medium'
  },
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Kitchen info
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  servingSize: {
    type: String,
    default: '1 serving'
  },
  // Nutrition info (optional)
  calories: Number,
  protein: String,
  carbs: String,
  fat: String,
  // Allergens
  allergens: [{
    type: String,
    enum: ['Nuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Shellfish', 'Fish']
  }],
  // Tags for search
  tags: [{
    type: String,
    trim: true
  }],
  // Customization options
  customizations: [{
    name: {
      type: String,
      required: true
    },
    options: [{
      name: String,
      price: Number // Additional price for this option
    }],
    isRequired: {
      type: Boolean,
      default: false
    },
    maxSelections: {
      type: Number,
      default: 1
    }
  }],
  // Inventory
  ingredients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  }],
  // Stats
  viewCount: {
    type: Number,
    default: 0
  },
  orderCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Display
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes for better performance
menuItemSchema.index({ category: 1, isAvailable: 1 })
menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' })
menuItemSchema.index({ isPopular: -1, orderCount: -1 })
menuItemSchema.index({ price: 1 })

// Virtual for discount percentage
menuItemSchema.virtual('discountPercent').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
  }
  return 0
})

// Increment view count
menuItemSchema.methods.incrementViews = function() {
  this.viewCount += 1
  return this.save()
}

// Increment order count
menuItemSchema.methods.incrementOrders = function(quantity = 1) {
  this.orderCount += quantity
  return this.save()
}

export default mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema)