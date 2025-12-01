import { cn } from '../../utils/helpers'

export const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-900',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    danger: 'bg-danger-100 text-danger-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
