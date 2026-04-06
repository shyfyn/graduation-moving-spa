import { BOX_STATUS_THEME } from '../../constants/theme'
import { cn } from '../../utils'
import type { BoxStatus } from '../../types'

export const BoxStatusBadge = ({ status }: { status: BoxStatus }) => (
  <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', BOX_STATUS_THEME[status])}>{status}</span>
)
