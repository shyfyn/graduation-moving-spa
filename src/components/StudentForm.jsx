import React from 'react'
import { UserPlus, AlignLeft, Presentation } from 'lucide-react'
import { STUDENT_LEVELS, FEEDBACK_LENGTHS, CLASS_TYPES } from '../data/constants'

export default function StudentForm({ name, setName, level, setLevel, classType, setClassType, length, setLength, onSave }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">学生姓名</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="输入姓名..."
            className="w-full border-b-2 border-slate-100 py-1 text-lg font-bold transition-colors placeholder:text-slate-300 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={onSave}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition-all hover:bg-blue-100"
          title="保存到常用学生列表"
        >
          <UserPlus className="h-5 w-5" />
        </button>
        <div className="w-20 border-l border-slate-100 pl-3">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">日期</label>
          <div className="py-1 text-sm font-medium text-slate-600">{new Date().toLocaleDateString().slice(5)}</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">当前学习阶段 (AI定向分析)</label>
        <div className="grid grid-cols-2 gap-2">
          {STUDENT_LEVELS.map((item) => (
            <button
              key={item.id}
              onClick={() => setLevel(item.id)}
              className={`rounded-lg border p-2 text-left text-xs transition-all ${
                level === item.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'
              }`}
            >
              <div className="font-bold">{item.label}</div>
              <div className="text-[10px] opacity-70">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Presentation className="h-3 w-3" /> 上课类型 (决定反馈结构)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CLASS_TYPES.map((item) => (
            <button
              key={item.id}
              onClick={() => setClassType(item.id)}
              className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all ${
                classType === item.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="font-bold">{item.label}</div>
                <div className="text-[10px] opacity-70">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <AlignLeft className="h-3 w-3" /> 生成篇幅设置
        </label>
        <div className="flex gap-2">
          {FEEDBACK_LENGTHS.map((item) => (
            <button
              key={item.id}
              onClick={() => setLength(item.id)}
              className={`flex-1 rounded-lg border py-2 text-center text-xs transition-all ${
                length === item.id
                  ? 'border-purple-500 bg-purple-50 font-bold text-purple-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
