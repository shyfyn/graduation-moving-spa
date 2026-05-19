import { Search, Clock3, Copy, Send, RefreshCcw, Trash2, Eye, ChevronDown, Users } from 'lucide-react'
import { CLASS_TYPES, HISTORY_STATUS_OPTIONS, HISTORY_VIEW_OPTIONS } from '../data/constants'
import { getStatusLabel, getStatusTone, summarizeTopics } from '../utils/history'

function HistoryCard({ record, classTypeLabelMap, onView, onReuse, onMarkSent, onDelete, onDirectCopy }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
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
        <details className="relative">
          <summary className="list-none rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-50">
            更多
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-32 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => onReuse(record)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-blue-700 hover:bg-blue-50"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> 复用
            </button>
            <button
              type="button"
              onClick={() => onDelete(record.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> 删除
            </button>
          </div>
        </details>
      </div>

      <p className="mt-3 line-clamp-4 rounded-2xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
        {record.feedbackText || '暂无反馈正文'}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onView(record)}
          className="inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Eye className="h-3.5 w-3.5" /> 查看/复制
        </button>
        <button
          type="button"
          onClick={() => onDirectCopy(record)}
          className="inline-flex items-center justify-center gap-1 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          <Copy className="h-3.5 w-3.5" /> 直接复制
        </button>
        <button
          type="button"
          onClick={() => onMarkSent(record.id)}
          className="inline-flex items-center justify-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
        >
          <Send className="h-3.5 w-3.5" /> 标记已发送
        </button>
      </div>
    </div>
  )
}

export default function HistoryList({
  records,
  groupedRecords,
  searchValue,
  setSearchValue,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  dateOptions,
  viewMode,
  setViewMode,
  onView,
  onReuse,
  onMarkSent,
  onDelete,
  onDirectCopy,
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
            placeholder="搜索学生、考点、问题标签、作业、随手记"
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
        <div className="mt-3 flex flex-wrap gap-2">
          {dateOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setDateFilter(option.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                dateFilter === option.id
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          {HISTORY_VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setViewMode(option.id)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium transition-all ${
                viewMode === option.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {option.id === 'student' ? <Users className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'student' ? (
        groupedRecords.length ? (
          <div className="space-y-3">
            {groupedRecords.map((group) => (
              <div key={group.studentName} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{group.studentName}</h3>
                    <p className="text-xs text-slate-500">最近 {group.count} 条反馈</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onView(group.records[0])}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    打开最近一次
                  </button>
                </div>
                <div className="space-y-2">
                  {group.records.slice(0, 5).map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => onView(record)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left hover:bg-slate-100"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          {record.dateLabel} · {summarizeTopics(record.selectedTopics)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {(record.selectedProblemTags || []).slice(0, 2).join('、') || record.rawNotes || '暂无问题记录'}
                        </div>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusTone(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-4 py-10 text-center text-sm text-slate-400">
            当前筛选条件下还没有学生维度历史记录。
          </div>
        )
      ) : records.length ? (
        <div className="space-y-3">
          {records.map((record) => (
            <HistoryCard
              key={record.id}
              record={record}
              classTypeLabelMap={classTypeLabelMap}
              onView={onView}
              onReuse={onReuse}
              onMarkSent={onMarkSent}
              onDelete={onDelete}
              onDirectCopy={onDirectCopy}
            />
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
