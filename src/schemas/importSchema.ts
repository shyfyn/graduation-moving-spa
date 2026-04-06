import { z } from 'zod'
import { BOX_DESTINATIONS, BOX_STATUSES, ITEM_CATEGORIES, ITEM_DESTINATIONS, ITEM_STATUSES, LOGISTICS_COMPANIES } from '../constants/enums'

const itemRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  category: z.enum(ITEM_CATEGORIES),
  destination: z.enum(ITEM_DESTINATIONS),
  status: z.enum(ITEM_STATUSES),
  boxId: z.string().nullable(),
  estimatedValue: z.number().min(0).optional(),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  isFragile: z.boolean().optional(),
  quantity: z.number().int().min(1).optional(),
})

const boxRecordSchema = z.object({
  id: z.string().min(1),
  boxCode: z.string().trim().min(1),
  destination: z.enum(BOX_DESTINATIONS),
  status: z.enum(BOX_STATUSES),
  weight: z.number().min(0).optional(),
  logisticsCompany: z.enum(LOGISTICS_COMPANIES).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  qrCodeValue: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  sealedAt: z.string().optional(),
  shippedAt: z.string().optional(),
  deliveredAt: z.string().optional(),
})

const checklistRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  done: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const importSchema = z.object({
  version: z.string().min(1),
  exportedAt: z.string().min(1),
  items: z.array(itemRecordSchema),
  boxes: z.array(boxRecordSchema),
  checklist: z.array(checklistRecordSchema),
}).superRefine((payload, ctx) => {
  const boxCodeSet = new Set<string>()
  const boxIdSet = new Set(payload.boxes.map((box) => box.id))

  for (const box of payload.boxes) {
    if (boxCodeSet.has(box.boxCode)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `箱号重复：${box.boxCode}`, path: ['boxes'] })
    }
    boxCodeSet.add(box.boxCode)
  }

  for (const item of payload.items) {
    if (item.boxId && !boxIdSet.has(item.boxId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `物品 ${item.name} 引用了不存在的箱子`, path: ['items'] })
    }
    if (['随身携带', '二手转卖', '丢弃/赠送'].includes(item.destination) && item.boxId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `物品 ${item.name} 当前目的地不允许装箱`, path: ['items'] })
    }
  }
})
