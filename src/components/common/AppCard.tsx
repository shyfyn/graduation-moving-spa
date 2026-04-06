import type { PropsWithChildren } from 'react'
import { cn } from '../../utils'

export const AppCard = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('rounded-2xl border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur', className)}>{children}</div>
)
