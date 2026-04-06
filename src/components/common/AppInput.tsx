import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils'

export const AppInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn('w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-slate-400', className)} {...props} />
)
