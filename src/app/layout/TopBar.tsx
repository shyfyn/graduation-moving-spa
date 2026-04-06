import { useLocation } from 'react-router-dom'

const titleMap: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: '毕业搬家驾驶舱', subtitle: '把打包、物流和断舍离压进一个手机工具里。' },
  '/items': { title: '物品清单', subtitle: '先管理好每一件东西，再决定去哪、怎么走。' },
  '/boxes': { title: '箱子管理', subtitle: '箱号、目的地、物流和模板都在这里集中处理。' },
  '/packing': { title: '装箱工作台', subtitle: '滑动、筛选、推荐，一次把同目的地物品装干净。' },
  '/checklist': { title: '搬家耗材', subtitle: '纸箱、胶带、压缩袋和泡沫，一个都别漏。' },
  '/settings': { title: '设置与备份', subtitle: '本地优先也要有恢复能力和分享出口。' },
}

export const TopBar = () => {
  const location = useLocation()
  const meta = location.pathname.startsWith('/boxes/')
    ? { title: '箱子详情', subtitle: '状态流转、物流录入、二维码和箱内物品都在同一页。' }
    : titleMap[location.pathname] ?? titleMap['/dashboard']

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="glass-panel mx-auto max-w-3xl rounded-[28px] px-4 py-4 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Graduation Moving OS</p>
            <h1 className="mt-2 text-[1.35rem] font-bold tracking-tight text-ink">{meta.title}</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">{meta.subtitle}</p>
          </div>
          <div className="hidden rounded-2xl bg-white/70 px-3 py-2 text-right md:block">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Mode</p>
            <p className="mt-1 text-sm font-semibold text-cocoa">Local First</p>
          </div>
        </div>
      </div>
    </header>
  )
}
