import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils'

export const AppSelect = ({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn('w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-slate-400', className)} {...props}>
    {children}
  </select>
)
