export const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-spin" />
        <div className="absolute inset-1 bg-white rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full opacity-20 animate-pulse-slow" />
      </div>
    </div>
  )
}

export default Loader
