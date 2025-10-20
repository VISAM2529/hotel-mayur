export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-300 inline-block text-center cursor-pointer'
  
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-orange-500 shadow-md',
    outline: 'bg-transparent hover:bg-orange-500 text-orange-500 hover:text-white border-2 border-orange-500',
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}