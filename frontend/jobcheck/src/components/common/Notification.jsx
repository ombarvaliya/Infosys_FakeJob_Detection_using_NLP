import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils/helpers'

export const Notification = ({ message, type = 'info', onClose, className, ...props }) => {
  const typeStyles = {
    success: {
      bg: 'bg-success-100',
      text: 'text-success-700',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-danger-100',
      text: 'text-danger-700',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-primary-100',
      text: 'text-primary-700',
      icon: Info,
    },
  }

  const { bg, text, icon: Icon } = typeStyles[type]

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border animate-slide-up',
        bg,
        text,
        className
      )}
      {...props}
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-current hover:opacity-70 transition-opacity">
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default Notification
