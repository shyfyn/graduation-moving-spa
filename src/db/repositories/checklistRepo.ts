import { db } from '../dexie'
import type { ChecklistItem } from '../../types'

export const checklistRepo = {
  list: () => db.checklist.orderBy('updatedAt').reverse().toArray(),
  bulkPut: (items: ChecklistItem[]) => db.checklist.bulkPut(items),
  put: (item: ChecklistItem) => db.checklist.put(item),
  clear: () => db.checklist.clear(),
}
