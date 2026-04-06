import { z } from 'zod'
import { ITEM_CATEGORIES, ITEM_DESTINATIONS, ITEM_STATUSES } from '../constants/enums'

export const itemSchema = z.object({
  name: z.string().trim().min(1, '请输入物品名称'),
  category: z.enum(ITEM_CATEGORIES),
  destination: z.enum(ITEM_DESTINATIONS),
  status: z.enum(ITEM_STATUSES),
  boxId: z.string().nullable().optional(),
  estimatedValue: z.coerce.number().optional().refine((value) => value === undefined || (!Number.isNaN(value) && value >= 0), '估值不能为负'),
  notes: z.string().trim().optional(),
  isFragile: z.boolean().optional(),
  quantity: z.coerce.number().int().min(1, '数量至少为 1').default(1),
})

export type ItemFormValues = z.infer<typeof itemSchema>
