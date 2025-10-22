export default function DashboardStats({ title, value, icon, color = 'primary', trend, subtitle, onClick }) {
  const colorClasses = {
    primary: 'from-primary-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    red: 'from-red-500 to-rose-500',
    yellow: 'from-yellow-500 to-amber-500',
    indigo: 'from-indigo-500 to-purple-500',
  }

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left w-full group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
      {trend && (
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-xs text-gray-500">{trend.label}</span>
        </div>
      )}
    </button>
  )
}