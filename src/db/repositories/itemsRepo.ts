import { db } from '../dexie'
import type { Item } from '../../types'

export const itemsRepo = {
  list: () => db.items.orderBy('updatedAt').reverse().toArray(),
  bulkPut: (items: Item[]) => db.items.bulkPut(items),
  put: (item: Item) => db.items.put(item),
  bulkDelete: (ids: string[]) => db.items.bulkDelete(ids),
  clear: () => db.items.clear(),
}
