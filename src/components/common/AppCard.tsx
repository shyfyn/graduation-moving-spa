import type { PropsWithChildren } from 'react'
import { cn } from '../../utils'

export const AppCard = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('glass-panel rounded-3xl p-4 shadow-soft ring-1 ring-white/60', className)}>{children}</div>
)
