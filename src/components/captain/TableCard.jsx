export default function TableCard({ table, onViewDetails }) {
  return (
    <button
      onClick={() => onViewDetails(table)}
      className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left w-full ${
        table.status === 'occupied'
          ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300 hover:border-red-400'
          : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:border-green-400'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-3xl">🪑</span>
            <h3 className="font-display text-2xl font-bold text-gray-900">
              Table {table.number}
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>👥 {table.capacity} seats</span>
            <span>•</span>
            <span>{table.type}</span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
          table.status === 'occupied'
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
        }`}>
          {table.status.toUpperCase()}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Floor: {table.floor}</span>
          {table.status === 'occupied' && (
            <span className="text-red-600 font-medium">🔴 In Use</span>
          )}
        </div>
      </div>
    </button>
  )
}