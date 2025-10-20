export default function Card({ children, className = '', hover = true }) {
  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-card overflow-hidden
        ${hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-2' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}