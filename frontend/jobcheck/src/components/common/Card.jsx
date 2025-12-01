import { cn } from '../../utils/helpers'

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-soft border border-slate-100 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-b border-slate-100', className)} {...props}>
    {children}
  </div>
)

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-t border-slate-100 bg-slate-50', className)} {...props}>
    {children}
  </div>
)

export default Card
