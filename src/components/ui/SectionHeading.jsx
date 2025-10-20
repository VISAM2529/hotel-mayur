export default function SectionHeading({ subtitle, title, highlight, description, centered = true }) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      {subtitle && (
        <p className="text-primary-500 font-medium text-sm md:text-base mb-2 uppercase tracking-wider">
          {subtitle}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
        {title} {highlight && (
          <span className="text-primary-500 relative">
            {highlight}
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent-400 rounded"></span>
          </span>
        )}
      </h2>
      {description && (
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}