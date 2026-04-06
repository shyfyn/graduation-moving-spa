import { db } from '../dexie'
import type { Box } from '../../types'

export const boxesRepo = {
  list: () => db.boxes.orderBy('updatedAt').reverse().toArray(),
  bulkPut: (boxes: Box[]) => db.boxes.bulkPut(boxes),
  put: (box: Box) => db.boxes.put(box),
  delete: (id: string) => db.boxes.delete(id),
  clear: () => db.boxes.clear(),
}
