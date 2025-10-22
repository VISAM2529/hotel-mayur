// src/models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'captain', 'waiter', 'chef', 'kitchen_staff'],
    default: 'waiter'
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: '👤'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For kitchen staff
  specialization: {
    type: String,
    enum: ['Main Course', 'Starters', 'Desserts', 'Breads & Tandoor', 'All'],
    default: 'All'
  },
  // Permissions
  permissions: {
    canManageMenu: { type: Boolean, default: false },
    canManageOrders: { type: Boolean, default: false },
    canManageTables: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canManageBilling: { type: Boolean, default: false }
  },
  // Login tracking
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    })
  }
  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } }
  // Lock the account if we've reached max attempts
  const maxAttempts = 5
  const lockTime = 2 * 60 * 60 * 1000 // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime }
  }
  return this.updateOne(updates)
}

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  })
}

export default mongoose.models.User || mongoose.model('User', userSchema)