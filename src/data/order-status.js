export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
}

export const STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    label: 'Order Pending',
    description: 'Waiting for confirmation',
    color: 'yellow',
    icon: '⏳',
    gradient: 'from-yellow-500 to-amber-500',
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Order Confirmed',
    description: 'Your order has been confirmed',
    color: 'blue',
    icon: '✅',
    gradient: 'from-blue-500 to-cyan-500',
  },
  [ORDER_STATUS.PREPARING]: {
    label: 'Cooking',
    description: 'Chef is preparing your food',
    color: 'orange',
    icon: '👨‍🍳',
    gradient: 'from-orange-500 to-red-500',
  },
  [ORDER_STATUS.READY]: {
    label: 'Ready to Serve',
    description: 'Your order is ready',
    color: 'purple',
    icon: '🔔',
    gradient: 'from-purple-500 to-pink-500',
  },
  [ORDER_STATUS.SERVED]: {
    label: 'Served',
    description: 'Enjoy your meal!',
    color: 'green',
    icon: '🍽️',
    gradient: 'from-green-500 to-emerald-500',
  },
  [ORDER_STATUS.COMPLETED]: {
    label: 'Completed',
    description: 'Order completed',
    color: 'gray',
    icon: '✓',
    gradient: 'from-gray-500 to-slate-500',
  },
}