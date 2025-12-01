import { cn } from '../../utils/helpers'

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'btn-gradient text-white hover:shadow-lg focus:ring-primary-500 disabled:opacity-50',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 disabled:opacity-50',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
