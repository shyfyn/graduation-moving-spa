import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils'

export const AppInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn('w-full rounded-2xl border border-white/70 bg-white/86 px-3.5 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100', className)} {...props} />
)
