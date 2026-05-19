import { ArrowRight, CheckCircle2, ClipboardCheck, CopyCheck, Clock3, Sparkles, Users } from 'lucide-react'
import { CLASS_TYPES } from '../data/constants'
import { getLatestHistoryForStudent, getStatusLabel, getStatusTone, summarizeTopics } from '../utils/history'

function StatCard({ label, value, tone, icon: Icon }) {
  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${tone}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-6 w-6 opacity-70" />
      </div>
    </div>
  )
}

export default function Dashboard({
  savedStudents,
  feedbackHistory,
  onStartFeedback,
  onViewHistoryRecord,
  onApplyTopic,
  onMarkSent,
}) {
  const classTypeLabelMap = Object.fromEntries(CLASS_TYPES.map((item) => [item.id, item.label]))
  const todayRecords = feedbackHistory.filter((record) => {
    const now = new Date()
    const value = new Date(record.createdAt)
    return (
      value.getFullYear() === now.getFullYear() &&
      value.getMonth() === now.getMonth() &&
      value.getDate() === now.getDate()
    )
  })

  const pendingCount = todayRecords.filter((record) => record.status === 'generated').length
  const copiedCount = todayRecords.filter((record) => record.status === 'copied').length
  const sentCount = todayRecords.filter((record) => record.status === 'sent').length

  const studentStatusList = savedStudents.map((student) => ({
    student,
    latestTodayRecord: getLatestHistoryForStudent(todayRecords, student.name),
  }))

  const recentStudents = Array.from(
    new Map(
      feedbackHistory.map((record) => [
        record.studentName,
        {
          name: record.studentName,
          level: record.studentLevel,
          createdAt: record.createdAt,
        },
      ]),
    ).values(),
  ).slice(0, 6)

  const topTopics = Array.from(
    feedbackHistory.reduce((map, record) => {
      record.selectedTopics.forEach((topic) => {
        map.set(topic, (map.get(topic) ?? 0) + 1)
      })
      return map
    }, new Map()),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Today Dashboard</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[1.7rem] font-bold tracking-tight text-slate-900">把今日待反馈学生压进一个工作台。</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">先看待发送，再回到写反馈。工作流要像老师备课后的处理台，不像表单堆积页。</p>
          </div>
          <button
            type="button"
            onClick={() => onStartFeedback(null)}
            className="hidden rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 md:inline-flex"
          >
            直接写反馈
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="今日反馈总数" value={todayRecords.length} icon={ClipboardCheck} tone="border-blue-200 bg-blue-50 text-blue-800" />
        <StatCard label="待发送数量" value={pendingCount} icon={Clock3} tone="border-amber-200 bg-amber-50 text-amber-800" />
        <StatCard label="已复制数量" value={copiedCount} icon={CopyCheck} tone="border-indigo-200 bg-indigo-50 text-indigo-800" />
        <StatCard label="已发送数量" value={sentCount} icon={CheckCircle2} tone="border-emerald-200 bg-emerald-50 text-emerald-800" />
        <StatCard label="常用学生数量" value={savedStudents.length} icon={Users} tone="border-slate-200 bg-slate-50 text-slate-800" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">今日待反馈学生</p>
            <p className="text-[11px] text-slate-500">常用学生今天是否已经完成反馈，一眼看清。</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
            <Users className="h-3 w-3" /> 今日进度
          </div>
        </div>
        <div className="space-y-3">
          {studentStatusList.length ? (
            studentStatusList.map(({ student, latestTodayRecord }) => (
              <div key={student.name} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{student.name}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusTone(latestTodayRecord?.status ?? 'generated')}`}>
                      {latestTodayRecord ? getStatusLabel(latestTodayRecord.status) : '待反馈'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{latestTodayRecord ? summarizeTopics(latestTodayRecord.selectedTopics) : '今天还没有生成反馈记录'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onStartFeedback(student)}
                    className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    写反馈
                  </button>
                  {latestTodayRecord ? (
                    <button
                      type="button"
                      onClick={() => onViewHistoryRecord(latestTodayRecord)}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      查看今日反馈
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">
              还没有常用学生，先在写反馈页保存学生。
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-bold text-slate-800">最近学生</p>
              <p className="text-[11px] text-slate-500">按最近生成记录去重，快速回到常用对象。</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentStudents.length ? (
              recentStudents.map((student) => (
                <button
                  key={`${student.name}-${student.createdAt}`}
                  type="button"
                  onClick={() => onStartFeedback(student)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  {student.name}
                </button>
              ))
            ) : (
              <span className="text-sm text-slate-400">还没有历史记录。</span>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-bold text-slate-800">常用知识点</p>
              <p className="text-[11px] text-slate-500">根据历史记录统计 Top 8，点一下直接带入写反馈。</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {topTopics.length ? (
              topTopics.map(([topic, count]) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onApplyTopic(topic)}
                  className="rounded-2xl border border-purple-200 bg-purple-50 px-3 py-2 text-left text-xs text-purple-700 hover:bg-purple-100"
                >
                  <div className="font-medium">{topic}</div>
                  <div className="mt-0.5 text-[10px] opacity-75">出现 {count} 次</div>
                </button>
              ))
            ) : (
              <span className="text-sm text-slate-400">生成几次反馈后，这里会出现高频考点。</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">今日记录列表</p>
            <p className="text-[11px] text-slate-500">今天生成过的反馈，支持查看与标记已发送。</p>
          </div>
        </div>
        <div className="space-y-3">
          {todayRecords.length ? (
            todayRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{record.studentName}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getStatusTone(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {classTypeLabelMap[record.classType] || record.classType} · {summarizeTopics(record.selectedTopics)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onViewHistoryRecord(record)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    查看
                  </button>
                  {record.status !== 'sent' ? (
                    <button
                      type="button"
                      onClick={() => onMarkSent(record.id)}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      标记已发送
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">
              今天还没有生成反馈，先从上方学生卡片开始。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
