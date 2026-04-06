import { DESTINATION_THEME } from '../../constants/theme'
import { cn } from '../../utils'
import type { ItemDestination } from '../../types'

export const DestinationBadge = ({ destination }: { destination: ItemDestination }) => (
  <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', DESTINATION_THEME[destination].badge)}>{destination}</span>
)
