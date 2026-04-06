export const DESTINATION_THEME = {
  '北京-亦庄': {
    badge: 'bg-yizhuang-100 text-yizhuang-600 border-yizhuang-100',
    card: 'from-yizhuang-50 to-white',
    accent: 'text-yizhuang-600',
  },
  '老家-朝阳': {
    badge: 'bg-chaoyang-100 text-chaoyang-600 border-chaoyang-100',
    card: 'from-chaoyang-50 to-white',
    accent: 'text-chaoyang-600',
  },
  '随身携带': {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-100',
    card: 'from-emerald-50 to-white',
    accent: 'text-emerald-700',
  },
  '二手转卖': {
    badge: 'bg-violet-100 text-violet-700 border-violet-100',
    card: 'from-violet-50 to-white',
    accent: 'text-violet-700',
  },
  '丢弃/赠送': {
    badge: 'bg-slate-200 text-slate-700 border-slate-200',
    card: 'from-slate-50 to-white',
    accent: 'text-slate-700',
  },
} as const

export const ITEM_STATUS_THEME = {
  '未处理': 'bg-slate-100 text-slate-700 border-slate-200',
  '已打包': 'bg-amber-100 text-amber-700 border-amber-200',
  '已寄出': 'bg-sky-100 text-sky-700 border-sky-200',
  '已送达': 'bg-emerald-100 text-emerald-700 border-emerald-200',
} as const

export const BOX_STATUS_THEME = {
  '打包中': 'bg-slate-100 text-slate-700 border-slate-200',
  '已封箱': 'bg-orange-100 text-orange-700 border-orange-200',
  '已寄出': 'bg-sky-100 text-sky-700 border-sky-200',
  '已签收': 'bg-emerald-100 text-emerald-700 border-emerald-200',
} as const
