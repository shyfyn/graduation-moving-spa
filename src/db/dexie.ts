import Dexie, { type Table } from 'dexie'
import type { Box, ChecklistItem, Item } from '../types'

export class MovingDatabase extends Dexie {
  items!: Table<Item, string>
  boxes!: Table<Box, string>
  checklist!: Table<ChecklistItem, string>

  constructor() {
    super('graduation-moving-db')
    this.version(1).stores({
      items: 'id, destination, status, category, boxId, updatedAt',
      boxes: 'id, &boxCode, destination, status, updatedAt',
      checklist: 'id, done, updatedAt',
    })
  }
}

export const db = new MovingDatabase()
