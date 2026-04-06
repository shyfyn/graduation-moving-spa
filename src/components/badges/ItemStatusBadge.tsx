import { ITEM_STATUS_THEME } from '../../constants/theme'
import { cn } from '../../utils'
import type { ItemStatus } from '../../types'

export const ItemStatusBadge = ({ status }: { status: ItemStatus }) => (
  <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', ITEM_STATUS_THEME[status])}>{status}</span>
)
