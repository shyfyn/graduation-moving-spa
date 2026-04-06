import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  fullWidth?: boolean
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-ink to-slate-700 text-white shadow-soft hover:from-slate-800 hover:to-slate-700',
  secondary: 'glass-panel text-ink hover:bg-white',
  ghost: 'bg-transparent text-slate-600 hover:bg-white/70',
  danger: 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-soft hover:from-rose-700 hover:to-rose-600',
}

export const AppButton = ({ children, className, variant = 'primary', fullWidth = false, ...props }: PropsWithChildren<Props>) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]',
      variantClasses[variant],
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
