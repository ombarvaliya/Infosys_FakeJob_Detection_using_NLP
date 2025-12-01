import { useState } from 'react'
import { cn } from '../../utils/helpers'

export const Tabs = ({ value, onValueChange, children, className, ...props }) => {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  )
}

export const TabsList = ({ children, className, ...props }) => {
  return (
    <div className={cn('flex border-b border-slate-200', className)} {...props}>
      {children}
    </div>
  )
}

export const TabsTrigger = ({ value, children, className, ...props }) => {
  return (
    <button
      className={cn(
        'px-4 py-3 font-medium text-slate-600 border-b-2 border-transparent hover:text-slate-900 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, children, className, ...props }) => {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  )
}

export default Tabs
