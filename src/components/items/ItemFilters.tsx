import { ITEM_CATEGORIES, ITEM_DESTINATIONS, ITEM_STATUSES } from '../../constants/enums'
import { AppCard } from '../common/AppCard'
import { AppSelect } from '../common/AppSelect'
import { SearchBar } from '../common/SearchBar'
import type { ItemFilters } from '../../types/filters'

export const ItemFiltersPanel = ({ filters, onChange }: { filters: ItemFilters; onChange: (filters: ItemFilters) => void }) => (
  <AppCard className="space-y-3">
    <SearchBar value={filters.keyword} onChange={(keyword) => onChange({ ...filters, keyword })} placeholder="搜索物品名称" />
    <div className="grid grid-cols-3 gap-2">
      <AppSelect value={filters.destination} onChange={(event) => onChange({ ...filters, destination: event.target.value as ItemFilters['destination'] })}>
        <option value="全部">全部目的地</option>
        {ITEM_DESTINATIONS.map((option) => <option key={option}>{option}</option>)}
      </AppSelect>
      <AppSelect value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as ItemFilters['status'] })}>
        <option value="全部">全部状态</option>
        {ITEM_STATUSES.map((option) => <option key={option}>{option}</option>)}
      </AppSelect>
      <AppSelect value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value as ItemFilters['category'] })}>
        <option value="全部">全部分类</option>
        {ITEM_CATEGORIES.map((option) => <option key={option}>{option}</option>)}
      </AppSelect>
    </div>
  </AppCard>
)
