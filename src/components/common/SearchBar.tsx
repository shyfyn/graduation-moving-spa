import { Search } from 'lucide-react'
import { AppInput } from './AppInput'

export const SearchBar = ({ value, onChange, placeholder = '搜索' }: { value: string; onChange: (value: string) => void; placeholder?: string }) => (
  <div className="relative">
    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
    <AppInput className="pl-9" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
  </div>
)
