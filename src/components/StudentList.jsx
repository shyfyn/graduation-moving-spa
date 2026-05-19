import React from 'react'
import { Users, Trash2 } from 'lucide-react'

export default function StudentList({ savedStudents, currentStudentName, onLoad, onDelete }) {
  if (savedStudents.length === 0) return null

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Users className="h-3 w-3" /> 常用学生 (点击载入)
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {savedStudents.map((student, index) => (
          <div
            key={index}
            onClick={() => onLoad(student)}
            className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 transition-all ${
              currentStudentName === student.name
                ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs font-medium">{student.name}</span>
            <button
              onClick={(event) => onDelete(event, student.name)}
              className={currentStudentName === student.name ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-red-500'}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
