import type { Box, ChecklistItem, Item, ItemCategory, ItemDestination } from '../types'

const keywordMap = [
  { match: ['羽绒服', '外套', '鞋', '袜', '衣', '裤', '包'], category: '衣物鞋包' as ItemCategory, destination: '老家-朝阳' as ItemDestination },
  { match: ['电脑', '笔记本', '相机', '单反', '硬盘', '充电器', '鼠标', '耳机', '显示器'], category: '电子数码' as ItemCategory, destination: '随身携带' as ItemDestination, isFragile: true },
  { match: ['书', '教材', '笔记', '文件', '资料', '证书'], category: '书籍文件' as ItemCategory, destination: '老家-朝阳' as ItemDestination },
  { match: ['牙刷', '牙膏', '毛巾', '被子', '杯子', '台灯', '收纳', '洗发水'], category: '生活用品' as ItemCategory, destination: '北京-亦庄' as ItemDestination },
]

const companionRules = [
  { keyword: '牙刷', suggestions: ['牙膏', '漱口杯'] },
  { keyword: '单反', suggestions: ['充电器', '电池', '存储卡'] },
  { keyword: '相机', suggestions: ['充电器', '电池', '存储卡'] },
  { keyword: '笔记本', suggestions: ['电源适配器', '鼠标'] },
  { keyword: '显示器', suggestions: ['HDMI 线', '电源线'] },
  { keyword: '床单', suggestions: ['被套', '枕套'] },
  { keyword: '剃须刀', suggestions: ['充电线', '刀头'] },
]

export const classifyItemDraft = (name: string) => {
  const normalized = name.trim()
  if (!normalized) return null
  const rule = keywordMap.find((entry) => entry.match.some((keyword) => normalized.includes(keyword)))
  if (!rule) return null
  const notes = rule.isFragile ? '建议单独包裹并放箱顶层' : undefined
  return {
    category: rule.category,
    destination: rule.destination,
    status: '未处理' as const,
    isFragile: rule.isFragile ?? false,
    notes,
    reason: `检测到关键词“${rule.match.find((keyword) => normalized.includes(keyword))}”`,
  }
}

export const getCompanionSuggestions = ({ packedItems, candidateItems }: { packedItems: Item[]; candidateItems: Item[] }) => {
  const names = packedItems.map((item) => item.name)
  const candidateNames = new Set(candidateItems.map((item) => item.name))
  const missing = new Map<string, string[]>()

  companionRules.forEach((rule) => {
    if (!names.some((name) => name.includes(rule.keyword))) return
    const absent = rule.suggestions.filter((suggestion) => !names.some((name) => name.includes(suggestion)) && Array.from(candidateNames).some((name) => name.includes(suggestion)))
    if (absent.length) missing.set(rule.keyword, absent)
  })

  return Array.from(missing.entries()).map(([source, suggestions]) => ({ source, suggestions }))
}

export const createShareSnapshotHtml = ({ items, boxes, checklist }: { items: Item[]; boxes: Box[]; checklist: ChecklistItem[] }) => {
  const exportedAt = new Date().toLocaleString('zh-CN')
  const deliveredHomeBoxes = boxes.filter((box) => box.destination === '老家-朝阳' && (box.status === '已寄出' || box.status === '已签收'))
  const rows = items.map((item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.destination}</td>
        <td>${item.status}</td>
        <td>${item.boxId ?? '-'}</td>
      </tr>`).join('')

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>毕业搬家分享页</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Segoe UI",sans-serif;background:#f8f4ea;color:#1f2937;margin:0;padding:24px}
.card{background:#fff;border-radius:20px;padding:20px;margin-bottom:16px;box-shadow:0 10px 30px rgba(15,23,42,.08)}
h1{margin:0 0 8px;font-size:28px}.muted{color:#64748b;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.stat{background:#f8fafc;border-radius:16px;padding:14px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left}th{color:#64748b}
.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#eff6ff;color:#2563eb;font-size:12px;margin-right:8px}
</style>
</head>
<body>
<div class="card">
  <h1>毕业搬家进度快照</h1>
  <div class="muted">导出时间：${exportedAt}</div>
</div>
<div class="card grid">
  <div class="stat"><div class="muted">物品总数</div><div>${items.length}</div></div>
  <div class="stat"><div class="muted">箱子总数</div><div>${boxes.length}</div></div>
  <div class="stat"><div class="muted">寄回老家的箱子</div><div>${deliveredHomeBoxes.length}</div></div>
  <div class="stat"><div class="muted">耗材清单完成</div><div>${checklist.filter((entry) => entry.done).length}/${checklist.length}</div></div>
</div>
<div class="card">
  <h2>重点说明</h2>
  <p><span class="badge">老家-朝阳</span>当前共有 ${items.filter((item) => item.destination === '老家-朝阳').length} 件物品，已寄出/签收箱子 ${deliveredHomeBoxes.length} 个。</p>
  <p><span class="badge">北京-亦庄</span>当前共有 ${items.filter((item) => item.destination === '北京-亦庄').length} 件物品。</p>
</div>
<div class="card">
  <h2>物品明细</h2>
  <table>
    <thead><tr><th>名称</th><th>分类</th><th>目的地</th><th>状态</th><th>箱号</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>
</body>
</html>`
}

export const createPosterHtml = ({ items, boxes }: { items: Item[]; boxes: Box[] }) => {
  const totalValue = items.reduce((sum, item) => sum + (item.estimatedValue ?? 0) * (item.quantity ?? 1), 0)
  const mostValuable = [...items].sort((a, b) => (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0))[0]
  const oldest = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>我的行李数字图鉴</title>
<style>
body{margin:0;background:linear-gradient(135deg,#eff6ff,#ffedd5);font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#0f172a}
.wrap{max-width:720px;margin:0 auto;padding:24px}.poster{background:rgba(255,255,255,.88);backdrop-filter:blur(10px);border-radius:28px;padding:28px;box-shadow:0 20px 60px rgba(15,23,42,.12)}
.label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.08em}.hero{font-size:44px;font-weight:800;margin:12px 0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}.cell{background:#fff;border-radius:18px;padding:16px}.v{font-size:28px;font-weight:700;margin-top:6px}
</style></head><body><div class="wrap"><div class="poster"><div class="label">My Moving Atlas</div><div class="hero">我的行李数字图鉴</div><p>共整理 ${items.length} 件物品，使用 ${boxes.length} 个箱子，总估值约 ¥${totalValue.toFixed(0)}。</p><div class="grid"><div class="cell"><div class="label">最贵物品</div><div class="v">${mostValuable?.name ?? '暂无'}</div></div><div class="cell"><div class="label">陪伴最久</div><div class="v">${oldest?.name ?? '暂无'}</div></div><div class="cell"><div class="label">随身携带</div><div class="v">${items.filter((item) => item.destination === '随身携带').length} 件</div></div><div class="cell"><div class="label">已签收箱子</div><div class="v">${boxes.filter((box) => box.status === '已签收').length} 箱</div></div></div></div></div></body></html>`
}
