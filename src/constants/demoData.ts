import { defaultChecklist } from './checklist'
import { createId, generateBoxQrPayload, nowIso } from '../utils'
import type { Box, ChecklistItem, Item } from '../types'

const now = nowIso()

export const demoItems: Item[] = [
  { id: createId('item'), name: '冬季羽绒服', category: '衣物鞋包', destination: '北京-亦庄', status: '未处理', boxId: null, estimatedValue: 699, quantity: 2, notes: '真空压缩后装箱', createdAt: now, updatedAt: now },
  { id: createId('item'), name: '跑鞋', category: '衣物鞋包', destination: '随身携带', status: '未处理', boxId: null, estimatedValue: 450, quantity: 1, createdAt: now, updatedAt: now },
  { id: createId('item'), name: 'iPad Pro', category: '电子数码', destination: '随身携带', status: '未处理', boxId: null, estimatedValue: 5500, isFragile: true, quantity: 1, createdAt: now, updatedAt: now },
  { id: createId('item'), name: '机械键盘', category: '电子数码', destination: '北京-亦庄', status: '已打包', boxId: 'box-bj-1', estimatedValue: 899, isFragile: true, quantity: 1, createdAt: now, updatedAt: now },
  { id: createId('item'), name: '毕业证与成绩单', category: '书籍文件', destination: '随身携带', status: '未处理', boxId: null, quantity: 1, createdAt: now, updatedAt: now },
  { id: createId('item'), name: '专业课教材', category: '书籍文件', destination: '老家-朝阳', status: '已打包', boxId: 'box-cy-1', estimatedValue: 320, quantity: 8, createdAt: now, updatedAt: now },
  { id: createId('item'), name: '洗漱用品收纳袋', category: '生活用品', destination: '北京-亦庄', status: '未处理', boxId: null, estimatedValue: 120, quantity: 1, createdAt: now, updatedAt: now },
  { id: createId('item'), name: '床上四件套', category: '生活用品', destination: '老家-朝阳', status: '已寄出', boxId: 'box-cy-2', estimatedValue: 260, quantity: 1, createdAt: now, updatedAt: now },
  { id: createId('item'), name: '台灯', category: '生活用品', destination: '北京-亦庄', status: '已送达', boxId: 'box-bj-2', estimatedValue: 188, isFragile: true, quantity: 1, createdAt: now, updatedAt: now },
  { id: createId('item'), name: '旧自行车', category: '其它', destination: '二手转卖', status: '未处理', boxId: null, estimatedValue: 300, notes: '准备挂闲鱼', createdAt: now, updatedAt: now },
  { id: createId('item'), name: '闲置水杯', category: '其它', destination: '丢弃/赠送', status: '未处理', boxId: null, quantity: 2, createdAt: now, updatedAt: now },
  { id: createId('item'), name: '移动硬盘', category: '电子数码', destination: '北京-亦庄', status: '未处理', boxId: null, estimatedValue: 420, isFragile: true, quantity: 1, createdAt: now, updatedAt: now }
]

export const demoBoxes: Box[] = [
  { id: 'box-bj-1', boxCode: 'BJ-YZ-001', destination: '北京-亦庄', status: '打包中', weight: 8.5, notes: '电子设备优先', createdAt: now, updatedAt: now },
  { id: 'box-bj-2', boxCode: 'BJ-YZ-002', destination: '北京-亦庄', status: '已签收', logisticsCompany: '顺丰', trackingNumber: 'SF1234567890', qrCodeValue: generateBoxQrPayload({ boxCode: 'BJ-YZ-002', destination: '北京-亦庄', status: '已签收', trackingNumber: 'SF1234567890' }), createdAt: now, updatedAt: now, sealedAt: now, shippedAt: now, deliveredAt: now },
  { id: 'box-cy-1', boxCode: 'CY-HOME-001', destination: '老家-朝阳', status: '已封箱', weight: 10.2, qrCodeValue: generateBoxQrPayload({ boxCode: 'CY-HOME-001', destination: '老家-朝阳', status: '已封箱' }), createdAt: now, updatedAt: now, sealedAt: now },
  { id: 'box-cy-2', boxCode: 'CY-HOME-002', destination: '老家-朝阳', status: '已寄出', logisticsCompany: '德邦', trackingNumber: 'DB20260406001', qrCodeValue: generateBoxQrPayload({ boxCode: 'CY-HOME-002', destination: '老家-朝阳', status: '已寄出', trackingNumber: 'DB20260406001' }), createdAt: now, updatedAt: now, sealedAt: now, shippedAt: now }
]

export const demoChecklist: ChecklistItem[] = defaultChecklist().map((item, index) => ({
  ...item,
  done: index < 3,
}))
