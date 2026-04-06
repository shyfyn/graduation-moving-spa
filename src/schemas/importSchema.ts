import { z } from 'zod'

export const importSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  items: z.array(z.any()),
  boxes: z.array(z.any()),
  checklist: z.array(z.any()),
})
