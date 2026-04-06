import type { Box, ChecklistItem, Item } from '../types'

type HealthIssue = {
  id: string
  level: 'warning' | 'error'
  title: string
  detail: string
}

export const inspectLocalData = ({ items, boxes, checklist }: { items: Item[]; boxes: Box[]; checklist: ChecklistItem[] }) => {
  const issues: HealthIssue[] = []
  const boxMap = new Map(boxes.map((box) => [box.id, box]))
  const boxCodeMap = new Map<string, number>()

  boxes.forEach((box) => {
    boxCodeMap.set(box.boxCode, (boxCodeMap.get(box.boxCode) ?? 0) + 1)

    if (box.status === '已寄出' && (!box.logisticsCompany || !box.trackingNumber)) {
      issues.push({
        id: `ship-${box.id}`,
        level: 'error',
        title: `箱子 ${box.boxCode} 缺少物流信息`,
        detail: '已寄出状态必须同时具备物流公司和运单号。',
      })
    }

    if (box.status === '已签收' && !box.deliveredAt) {
      issues.push({
        id: `delivered-${box.id}`,
        level: 'warning',
        title: `箱子 ${box.boxCode} 缺少签收时间`,
        detail: '状态已到“已签收”，但没有记录签收时间。',
      })
    }
  })

  for (const [boxCode, count] of boxCodeMap.entries()) {
    if (count > 1) {
      issues.push({
        id: `duplicate-${boxCode}`,
        level: 'error',
        title: `箱号 ${boxCode} 重复`,
        detail: '箱号应保持唯一，否则导入导出和查找都会混乱。',
      })
    }
  }

  items.forEach((item) => {
    if (!item.boxId) {
      if ((item.destination === '北京-亦庄' || item.destination === '老家-朝阳') && item.status === '已打包') {
        issues.push({
          id: `packed-no-box-${item.id}`,
          level: 'warning',
          title: `物品 ${item.name} 显示已打包但未关联箱子`,
          detail: '建议检查是否误移出箱子或状态未回退。',
        })
      }
      return
    }

    const box = boxMap.get(item.boxId)
    if (!box) {
      issues.push({
        id: `missing-box-${item.id}`,
        level: 'error',
        title: `物品 ${item.name} 引用了不存在的箱子`,
        detail: '请重新装箱或导入修复。',
      })
      return
    }

    if (item.destination !== box.destination) {
      issues.push({
        id: `destination-${item.id}`,
        level: 'error',
        title: `物品 ${item.name} 与箱子目的地不一致`,
        detail: `物品是 ${item.destination}，但箱子 ${box.boxCode} 是 ${box.destination}。`,
      })
    }

    if (item.destination === '随身携带' || item.destination === '二手转卖' || item.destination === '丢弃/赠送') {
      issues.push({
        id: `forbidden-box-${item.id}`,
        level: 'error',
        title: `物品 ${item.name} 不应被装箱`,
        detail: '这类目的地物品必须保持 boxId 为空。',
      })
    }
  })

  if (!checklist.length) {
    issues.push({
      id: 'empty-checklist',
      level: 'warning',
      title: '耗材清单为空',
      detail: '建议重新初始化默认清单，避免漏买基础耗材。',
    })
  }

  return {
    issueCount: issues.length,
    errorCount: issues.filter((issue) => issue.level === 'error').length,
    warningCount: issues.filter((issue) => issue.level === 'warning').length,
    issues,
  }
}
