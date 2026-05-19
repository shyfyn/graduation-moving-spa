import React, { useState } from 'react'
import { Search, PlusCircle, X, Beaker, Atom, Flame, TestTube2, Layers } from 'lucide-react'
import { TOPIC_ALIAS_MAP } from '../data/constants'

const getModuleIcon = (name) => {
  if (name.includes('必修一')) return <Beaker className="h-4 w-4" />
  if (name.includes('必修二')) return <Atom className="h-4 w-4" />
  if (name.includes('选修四')) return <Flame className="h-4 w-4" />
  if (name.includes('选修五')) return <Layers className="h-4 w-4" />
  return <TestTube2 className="h-4 w-4" />
}

export default function SyllabusSelector({
  library,
  activeModule,
  setActiveModule,
  selectedTopics,
  recentTopics = [],
  onToggle,
  onAddCustom,
  carryoverTopic,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [customTopic, setCustomTopic] = useState('')

  const getFilteredTopics = () => {
    if (!searchQuery) return library[activeModule]
    const keyword = searchQuery.toLowerCase().trim()
    return Array.from(
      new Set(
        Object.values(library)
      .flat()
          .filter((topic) => {
            if (topic.toLowerCase().includes(keyword)) return true
            const aliases = TOPIC_ALIAS_MAP[topic] || []
            return aliases.some((alias) => alias.toLowerCase().includes(keyword) || keyword.includes(alias.toLowerCase()))
          }),
      ),
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索考点 (如: 氧化还原、氧还、电极...)"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-200"
          />
        </div>
        {carryoverTopic ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            已从工作台带入：{carryoverTopic}
          </div>
        ) : null}
        {recentTopics.length ? (
          <div className="mt-3">
            <div className="mb-2 text-[11px] font-semibold text-slate-500">最近使用</div>
            <div className="flex flex-wrap gap-2">
              {recentTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onToggle(topic)}
                  className={`rounded-full border px-3 py-1 text-[11px] transition-all ${
                    selectedTopics.includes(topic)
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex h-64">
        {!searchQuery && (
          <div className="flex w-24 flex-col overflow-y-auto border-r border-slate-200 bg-slate-50">
            {Object.keys(library).map((moduleName) => (
              <button
                key={moduleName}
                onClick={() => setActiveModule(moduleName)}
                className={`border-l-2 p-3 text-left text-[10px] font-medium leading-tight transition-all ${
                  activeModule === moduleName ? 'border-purple-600 bg-white text-purple-700' : 'border-transparent text-slate-500 hover:bg-slate-100'
                }`}
              >
                {moduleName.split('·')[0]}
                <br />
                <span className="text-[9px] opacity-70">{moduleName.split('·')[1]}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto bg-white p-3">
          {!searchQuery && (
            <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold text-slate-600">
              {getModuleIcon(activeModule)} {activeModule}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {getFilteredTopics().length > 0 ? (
              getFilteredTopics().map((topic) => (
                <button
                  key={topic}
                  onClick={() => onToggle(topic)}
                  className={`rounded border px-3 py-1.5 text-xs transition-all ${
                    selectedTopics.includes(topic)
                      ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'
                  }`}
                >
                  {topic}
                </button>
              ))
            ) : (
              <div className="p-4 text-xs text-slate-400">未找到相关考点，您可以在下方添加...</div>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-[60px] border-t border-slate-200 bg-slate-50 p-3">
        {selectedTopics.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-2 py-1 text-[10px] text-purple-800"
              >
                {topic}
                <button onClick={() => onToggle(topic)}>
                  <X className="h-3 w-3 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="mb-2 text-xs italic text-slate-400">请从上方选择本节课讲解的考点...</div>
        )}

        <div className="mt-2 flex gap-2">
          <input
            value={customTopic}
            onChange={(event) => setCustomTopic(event.target.value)}
            placeholder="没找到？输入并永久加入库..."
            className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs focus:border-purple-400 focus:outline-none"
            onKeyDown={(event) => event.key === 'Enter' && onAddCustom(customTopic, setCustomTopic)}
          />
          <button
            onClick={() => onAddCustom(customTopic, setCustomTopic)}
            className="flex items-center gap-1 rounded bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700"
          >
            <PlusCircle className="h-3 w-3" /> 添加
          </button>
        </div>
      </div>
    </div>
  )
}
