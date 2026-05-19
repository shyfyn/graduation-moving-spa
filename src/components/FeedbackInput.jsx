import React, { useEffect, useRef, useState } from 'react'
import { AlertCircle, CalendarClock, Wand2, Loader2, Mic, MicOff } from 'lucide-react'
import { HIGHLIGHTS, PROBLEM_TAGS, HOMEWORK_TYPES } from '../data/constants'

export default function FeedbackInput({ highlights, setHighlights, notes, setNotes, prevHw, setPrevHw, newHw, setNewHw, onGenerate, isPolishing }) {
  const inputNotesRef = useRef(null)
  const inputHwRef = useRef(null)
  const [isListening, setIsListening] = useState(false)

  const adjustTextareaHeight = (element, buffer = 24) => {
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight + buffer}px`
  }

  useEffect(() => {
    if (inputNotesRef.current) adjustTextareaHeight(inputNotesRef.current, 0)
  }, [notes])

  useEffect(() => {
    if (inputHwRef.current) adjustTextareaHeight(inputHwRef.current, 0)
  }, [newHw])

  const toggleHighlight = (value) => {
    setHighlights((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const appendToNotes = (value) => setNotes((prev) => (prev ? `${prev}，${value}` : value))
  const appendToHomework = (value) => setNewHw((prev) => (prev ? `${prev}，${value}` : value))

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('抱歉，您的浏览器暂不支持语音输入，请使用 Chrome 或 Safari。')
      return
    }

    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => {
      setIsListening(false)
      alert('语音识别出错，请重试。')
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      appendToNotes(transcript)
    }

    recognition.start()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">课堂状态 (多选)</label>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHTS.map((item) => (
            <button
              key={item}
              onClick={() => toggleHighlight(item)}
              className={`rounded border px-2 py-1 text-xs transition-all ${
                highlights.includes(item) ? 'border-orange-300 bg-orange-50 font-medium text-orange-700' : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-bold text-orange-800">
            <AlertCircle className="h-4 w-4" /> 深度学情记录
          </label>
          <button
            onClick={startListening}
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-all ${
              isListening ? 'animate-pulse border-red-500 bg-red-500 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            {isListening ? '正在听...' : '语音输入'}
          </button>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {PROBLEM_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => appendToNotes(tag)}
              className="rounded border border-orange-200 bg-white px-2 py-1 text-[10px] text-orange-700 transition-colors hover:bg-orange-100"
            >
              + {tag}
            </button>
          ))}
        </div>
        <textarea
          ref={inputNotesRef}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onInput={(event) => adjustTextareaHeight(event.target, 0)}
          placeholder="点击右上角语音输入，或打字... 例如：讲了电解池，阳极反应式写错了。"
          className="min-h-[80px] w-full resize-none overflow-hidden rounded-lg border border-orange-200 bg-white p-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-800">
            <CalendarClock className="h-4 w-4" /> 作业布置与规划
          </label>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {HOMEWORK_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => appendToHomework(type)}
              className="rounded border border-blue-200 bg-white px-2 py-1 text-[10px] text-blue-700 transition-colors hover:bg-blue-100"
            >
              + {type}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <input
            value={prevHw}
            onChange={(event) => setPrevHw(event.target.value)}
            placeholder="上节作业反馈：如 完成质量很高，仅错一题"
            className="w-full rounded-lg border border-blue-200 bg-white p-2 text-xs focus:border-blue-400 focus:outline-none"
          />
          <textarea
            ref={inputHwRef}
            value={newHw}
            onChange={(event) => setNewHw(event.target.value)}
            onInput={(event) => adjustTextareaHeight(event.target, 0)}
            placeholder="布置新作业：如 完成《五三》P20-22。"
            className="min-h-[60px] w-full resize-none overflow-hidden rounded-lg border border-blue-200 bg-white p-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isPolishing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all"
      >
        {isPolishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
        {isPolishing ? '付老师正在深度分析...' : '生成专业反馈报告'}
      </button>
    </div>
  )
}
