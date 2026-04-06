import { createId, nowIso } from '../utils'
import type { ChecklistItem } from '../types'

const names = ['纸箱', '胶带', '压缩袋', '记号笔', '防撞泡沫', '标签贴', '缠绕膜', '封箱器', '防潮袋']

export const defaultChecklist = (): ChecklistItem[] =>
  names.map((name) => ({
    id: createId('chk'),
    name,
    done: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }))
