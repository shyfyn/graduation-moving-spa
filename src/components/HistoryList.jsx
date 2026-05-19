import { Search, Clock3, Copy, Send, RefreshCcw, Trash2, Eye } from 'lucide-react'
import { CLASS_TYPES, HISTORY_STATUS_OPTIONS } from '../data/constants'
import { getStatusLabel, getStatusTone, summarizeTopics } from '../utils/history'

export default function HistoryList({
  records,
  searchValue,
  setSearchValue,
  statusFilter,
  setStatusFilter,
  onView,
  onReuse,
  onMarkSent,
  onDelete,
}) {
  const classTypeLabelMap = Object.fromEntries(CLASS_TYPES.map((item) => [item.id, item.label]))

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="搜索学生姓名"
            className="w-full rounded-2xl border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {HISTORY_STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setStatusFilter(option.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === option.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {records.length ? (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">{record.studentName}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusTone(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" /> {record.dateLabel}
                    </span>
                    <span>{classTypeLabelMap[record.classType] || record.classType || '未填写课型'}</span>
                    <span>{summarizeTopics(record.selectedTopics)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(record.id)}
                  className="rounded-full border border-slate-200 p-2 text-slate-400 transition-colors hover:border-red-200 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 line-clamp-4 rounded-2xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
                {record.feedbackText || '暂无反馈正文'}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => onView(record)}
                  className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" /> 查看详情
                </button>
                <button
                  type="button"
                  onClick={() => onReuse(record)}
                  className="inline-flex items-center justify-center gap-1 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> 复用本次
                </button>
                <button
                  type="button"
                  onClick={() => onMarkSent(record.id)}
                  className="inline-flex items-center justify-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <Send className="h-3.5 w-3.5" /> 标记已发送
                </button>
                <button
                  type="button"
                  onClick={() => onView(record, 'copy')}
                  className="inline-flex items-center justify-center gap-1 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
                >
                  <Copy className="h-3.5 w-3.5" /> 查看后复制
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-4 py-10 text-center text-sm text-slate-400">
          当前筛选条件下还没有历史记录。
        </div>
      )}
    </div>
  )
}
