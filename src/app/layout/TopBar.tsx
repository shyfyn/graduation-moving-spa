import { useLocation } from 'react-router-dom'

const titleMap: Record<string, string> = {
  '/dashboard': '毕业搬家行李管理系统',
  '/items': '物品管理',
  '/boxes': '箱子管理',
  '/packing': '装箱工作台',
  '/checklist': '搬家耗材清单',
  '/settings': '设置与备份',
}

export const TopBar = () => {
  const location = useLocation()
  const title = location.pathname.startsWith('/boxes/') ? '箱子详情' : titleMap[location.pathname] ?? '毕业搬家行李管理系统'

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-cream/90 px-4 py-4 backdrop-blur">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">local first</p>
        <h1 className="mt-1 text-lg font-semibold text-ink">{title}</h1>
      </div>
    </header>
  )
}
