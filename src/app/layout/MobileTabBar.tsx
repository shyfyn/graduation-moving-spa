import { Boxes, ClipboardList, Home, PackageSearch, Settings, ShoppingBag } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils'

const tabs = [
  { to: '/dashboard', label: '首页', icon: Home },
  { to: '/items', label: '物品', icon: ShoppingBag },
  { to: '/boxes', label: '箱子', icon: Boxes },
  { to: '/packing', label: '装箱', icon: PackageSearch },
  { to: '/checklist', label: '清单', icon: ClipboardList },
  { to: '/settings', label: '设置', icon: Settings },
]

export const MobileTabBar = () => (
  <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/90 px-2 py-2 backdrop-blur">
    <div className="mx-auto grid max-w-3xl grid-cols-6 gap-1">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => cn('flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] transition', isActive ? 'bg-slate-100 text-ink' : 'text-slate-500')}>
          <Icon className="size-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
)
