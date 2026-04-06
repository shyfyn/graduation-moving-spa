import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  fullWidth?: boolean
}

const variantClasses = {
  primary: 'bg-ink text-white hover:bg-slate-800',
  secondary: 'bg-white text-ink border border-slate-200 hover:border-slate-300',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
}

export const AppButton = ({ children, className, variant = 'primary', fullWidth = false, ...props }: PropsWithChildren<Props>) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
      variantClasses[variant],
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
