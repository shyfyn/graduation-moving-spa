import React, { useEffect, useMemo, useRef, useState } from 'react'
import { School, Check, Copy, Edit3, MessageSquare, Save, X, LayoutGrid, PenSquare, History, Send } from 'lucide-react'
import { INITIAL_SYLLABUS, STUDENT_LEVELS, CLASS_TYPES } from './data/constants'
import StudentList from './components/StudentList'
import StudentForm from './components/StudentForm'
import SyllabusSelector from './components/SyllabusSelector'
import FeedbackInput from './components/FeedbackInput'
import Dashboard from './components/Dashboard'
import HistoryList from './components/HistoryList'
import { safeReadJson, safeReadText, safeWriteJson, safeWriteText } from './utils/storage'
import { buildSystemPrompt, buildUserContent } from './utils/promptBuilder'
import { createHistoryRecord, getStatusLabel } from './utils/history'

export default function ChemFeedbackApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [savedStudents, setSavedStudents] = useState(() => safeReadJson('my_students_list', []))
  const [syllabusLibrary, setSyllabusLibrary] = useState(() => safeReadJson('my_syllabus_lib', INITIAL_SYLLABUS) || INITIAL_SYLLABUS)
  const [studentName, setStudentName] = useState(() => safeReadText('s_name'))
  const [studentLevel, setStudentLevel] = useState(() => safeReadText('s_level', 'improve'))
  const [classType, setClassType] = useState(() => safeReadText('s_classType', 'new_lesson'))
  const [activeModule, setActiveModule] = useState('必修一·基本概念')
  const [selectedTopics, setSelectedTopics] = useState(() => safeReadJson('s_topics', []))
  const [selectedHighlights, setSelectedHighlights] = useState(() => safeReadJson('s_highlights', []))
  const [selectedProblemTags, setSelectedProblemTags] = useState(() => safeReadJson('s_problem_tags', []))
  const [selectedAbilityTags, setSelectedAbilityTags] = useState(() => safeReadJson('s_ability_tags', []))
  const [prevHomework, setPrevHomework] = useState(() => safeReadText('s_prevHw', '完成不错'))
  const [rawNotes, setRawNotes] = useState(() => safeReadText('s_notes'))
  const [newHomework, setNewHomework] = useState(() => safeReadText('s_newHw'))
  const [feedbackLength, setFeedbackLength] = useState(() => safeReadText('s_length', 'standard'))
  const [feedbackHistory, setFeedbackHistory] = useState(() => safeReadJson('chem_feedback_history_v1', []))
  const [polishedFeedback, setPolishedFeedback] = useState('')
  const [isPolishing, setIsPolishing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentHistoryId, setCurrentHistoryId] = useState(null)
  const [historySearch, setHistorySearch] = useState('')
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all')
  const textareaRef = useRef(null)

  const levelInfo = STUDENT_LEVELS.find((level) => level.id === studentLevel)
  const classTypeInfo = CLASS_TYPES.find((type) => type.id === classType)

  const getApiKey = () => {
    try {
      return import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || ''
    } catch {
      return ''
    }
  }

  const apiKey = getApiKey()

  useEffect(() => {
    safeWriteJson('my_students_list', savedStudents)
  }, [savedStudents])

  useEffect(() => {
    safeWriteJson('my_syllabus_lib', syllabusLibrary)
  }, [syllabusLibrary])

  useEffect(() => {
    safeWriteText('s_name', studentName)
  }, [studentName])

  useEffect(() => {
    safeWriteText('s_level', studentLevel)
  }, [studentLevel])

  useEffect(() => {
    safeWriteText('s_classType', classType)
  }, [classType])

  useEffect(() => {
    safeWriteText('s_length', feedbackLength)
  }, [feedbackLength])

  useEffect(() => {
    safeWriteJson('s_topics', selectedTopics)
  }, [selectedTopics])

  useEffect(() => {
    safeWriteJson('s_highlights', selectedHighlights)
  }, [selectedHighlights])

  useEffect(() => {
    safeWriteJson('s_problem_tags', selectedProblemTags)
  }, [selectedProblemTags])

  useEffect(() => {
    safeWriteJson('s_ability_tags', selectedAbilityTags)
  }, [selectedAbilityTags])

  useEffect(() => {
    safeWriteText('s_prevHw', prevHomework)
  }, [prevHomework])

  useEffect(() => {
    safeWriteText('s_notes', rawNotes)
  }, [rawNotes])

  useEffect(() => {
    safeWriteText('s_newHw', newHomework)
  }, [newHomework])

  useEffect(() => {
    safeWriteJson('chem_feedback_history_v1', feedbackHistory)
  }, [feedbackHistory])

  useEffect(() => {
    if (activeTab === 'preview' && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current)
    }
  }, [polishedFeedback, activeTab])

  useEffect(() => {
    if (!currentHistoryId || !polishedFeedback.trim()) return
    setFeedbackHistory((prev) =>
      prev.map((record) =>
        record.id === currentHistoryId
          ? { ...record, feedbackText: polishedFeedback, updatedAt: new Date().toISOString() }
          : record,
      ),
    )
  }, [currentHistoryId, polishedFeedback])

  const filteredHistory = useMemo(() => {
    return feedbackHistory.filter((record) => {
      const matchesSearch = !historySearch.trim() || record.studentName.includes(historySearch.trim())
      const matchesStatus = historyStatusFilter === 'all' || record.status === historyStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [feedbackHistory, historySearch, historyStatusFilter])

  const hasInputContent =
    studentName.trim() ||
    rawNotes.trim() ||
    newHomework.trim() ||
    selectedTopics.length ||
    selectedHighlights.length ||
    selectedProblemTags.length ||
    selectedAbilityTags.length

  function adjustTextareaHeight(element, buffer = 24) {
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight + buffer}px`
  }

  function handleSaveStudentToList() {
    if (!studentName.trim()) {
      alert('请先输入学生姓名！')
      return
    }

    const existingIndex = savedStudents.findIndex((student) => student.name === studentName.trim())
    const nextList = [...savedStudents]

    if (existingIndex >= 0) {
      nextList[existingIndex] = { name: studentName.trim(), level: studentLevel }
      alert(`已更新【${studentName}】信息！`)
    } else {
      nextList.push({ name: studentName.trim(), level: studentLevel })
      alert(`已保存【${studentName}】！`)
    }

    setSavedStudents(nextList)
  }

  function handleLoadStudent(student) {
    if (studentName && studentName !== student.name && (rawNotes || selectedTopics.length > 0)) {
      if (!confirm(`确定切换到【${student.name}】吗？`)) return
    }

    setStudentName(student.name)
    setStudentLevel(student.level || 'improve')
    setActiveTab('input')
  }

  function handleDeleteStudent(event, name) {
    event.stopPropagation()
    if (confirm(`确定删除【${name}】吗？`)) {
      setSavedStudents(savedStudents.filter((student) => student.name !== name))
    }
  }

  function handleAddCustomTopic(topic, setInput) {
    const nextTopic = topic.trim()
    if (!nextTopic) return

    if (!selectedTopics.includes(nextTopic)) {
      setSelectedTopics([...selectedTopics, nextTopic])
    }

    if (!syllabusLibrary[activeModule].includes(nextTopic)) {
      const nextLibrary = { ...syllabusLibrary }
      nextLibrary[activeModule] = [...syllabusLibrary[activeModule], nextTopic]
      setSyllabusLibrary(nextLibrary)
      alert(`已永久添加考点：${nextTopic}`)
    }

    setInput('')
  }

  function toggleTopic(topic) {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic]))
  }

  function clearAll() {
    if (!confirm('确定清空？')) return
    setStudentName('')
    setSelectedTopics([])
    setSelectedHighlights([])
    setSelectedProblemTags([])
    setSelectedAbilityTags([])
    setRawNotes('')
    setPrevHomework('完成不错')
    setNewHomework('')
    setPolishedFeedback('')
    setCurrentHistoryId(null)
    setCopied(false)
  }

  function upsertHistoryStatus(id, status) {
    setFeedbackHistory((prev) =>
      prev.map((record) =>
        record.id === id
          ? { ...record, status, feedbackText: polishedFeedback || record.feedbackText, updatedAt: new Date().toISOString() }
          : record,
      ),
    )
  }

  function applyRecordToForm(record, targetTab = null) {
    setStudentName(record.studentName || '')
    setStudentLevel(record.studentLevel || 'improve')
    setClassType(record.classType || 'new_lesson')
    setSelectedTopics(record.selectedTopics || [])
    setSelectedHighlights(record.selectedHighlights || [])
    setSelectedProblemTags(record.selectedProblemTags || [])
    setSelectedAbilityTags(record.selectedAbilityTags || [])
    setPrevHomework(record.prevHomework || '')
    setRawNotes(record.rawNotes || '')
    setNewHomework(record.newHomework || '')
    setPolishedFeedback(record.feedbackText || '')
    setCurrentHistoryId(record.id)
    setCopied(record.status === 'copied')
    setActiveTab(targetTab || (record.feedbackText ? 'preview' : 'input'))
  }

  function startNewFeedback(student = null) {
    if (student) {
      setStudentName(student.name || '')
      setStudentLevel(student.level || 'improve')
    }
    setCopied(false)
    setCurrentHistoryId(null)
    setPolishedFeedback('')
    setActiveTab('input')
  }

  function handleDeleteHistoryRecord(id) {
    if (!confirm('确定删除这条历史记录吗？')) return
    setFeedbackHistory((prev) => prev.filter((record) => record.id !== id))
    if (currentHistoryId === id) {
      setCurrentHistoryId(null)
      setPolishedFeedback('')
      setCopied(false)
    }
  }

  async function handleAIGenerate() {
    if (!studentName.trim()) {
      alert('请填写学生姓名')
      return
    }

    if (selectedTopics.length === 0 && !rawNotes.trim()) {
      alert('请至少选择一个知识点或填写一些随手记')
      return
    }

    if (!apiKey) {
      alert('缺少 API Key，请配置 VITE_DEEPSEEK_API_KEY。')
      return
    }

    setIsPolishing(true)

    try {
      const systemPrompt = buildSystemPrompt({
        levelInfo,
        classTypeInfo,
        feedbackLength,
        classType,
        rawNotes,
        selectedTopics,
        selectedHighlights,
        selectedProblemTags,
        selectedAbilityTags,
        newHomework,
      })

      const userContent = buildUserContent({
        studentName,
        classTypeInfo,
        levelInfo,
        selectedTopics,
        selectedHighlights,
        selectedProblemTags,
        selectedAbilityTags,
        prevHomework,
        rawNotes,
        newHomework,
      })

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          stream: false,
        }),
      })

      const data = await response.json()
      const result = data.choices?.[0]?.message?.content

      if (!result) {
        alert('生成失败，请检查 API Key。')
        return
      }

      const feedbackText = result.trim()
      const nextRecord = createHistoryRecord({
        studentName,
        studentLevel,
        classType,
        selectedTopics,
        selectedHighlights,
        selectedProblemTags,
        selectedAbilityTags,
        prevHomework,
        rawNotes,
        newHomework,
        feedbackText,
      })

      setPolishedFeedback(feedbackText)
      setCurrentHistoryId(nextRecord.id)
      setCopied(false)
      setFeedbackHistory((prev) => [nextRecord, ...prev].slice(0, 200))
      setActiveTab('preview')
    } catch {
      alert('网络连接失败，请检查网络。')
    } finally {
      setIsPolishing(false)
    }
  }

  async function copyToClipboard() {
    const text = polishedFeedback + (newHomework ? `\n\n📝 【本次作业】：\n${newHomework}` : '')

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (currentHistoryId) upsertHistoryStatus(currentHistoryId, 'copied')
        setTimeout(() => setCopied(false), 2000)
        return
      } catch {}
    }

    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      setCopied(true)
      if (currentHistoryId) upsertHistoryStatus(currentHistoryId, 'copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('复制失败')
    }

    document.body.removeChild(textArea)
  }

  const navItems = [
    { id: 'dashboard', label: '工作台', icon: LayoutGrid },
    { id: 'input', label: '写反馈', icon: PenSquare },
    { id: 'history', label: '历史', icon: History },
  ]

  const currentHistoryStatus = currentHistoryId
    ? feedbackHistory.find((record) => record.id === currentHistoryId)?.status || 'generated'
    : null

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans text-slate-800">
      <div className="sticky top-0 z-30 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto max-w-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-800">
              <School className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">百时教育</span>
                <span className="text-[10px] leading-tight text-slate-500">ChemFeedback Pro</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === 'input' && hasInputContent ? (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-500 shadow-sm"
                >
                  <X className="h-3 w-3" /> 清空
                </button>
              ) : null}
              {currentHistoryStatus && activeTab === 'preview' ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  {getStatusLabel(currentHistoryStatus)}
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">付伊宁老师</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-xl space-y-4 p-4">
        {activeTab === 'dashboard' ? (
          <Dashboard
            savedStudents={savedStudents}
            feedbackHistory={feedbackHistory}
            onStartFeedback={startNewFeedback}
            onViewHistoryRecord={(record) => applyRecordToForm(record, 'preview')}
            onApplyTopic={(topic) => {
              setSelectedTopics((prev) => (prev.includes(topic) ? prev : [...prev, topic]))
              setActiveTab('input')
            }}
            onMarkSent={(id) => upsertHistoryStatus(id, 'sent')}
          />
        ) : null}

        {activeTab === 'input' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-1 text-center text-[10px] text-slate-400">
              <Save className="h-3 w-3" /> 内容已自动保存
            </div>

            <StudentList
              savedStudents={savedStudents}
              currentStudentName={studentName}
              onLoad={handleLoadStudent}
              onDelete={handleDeleteStudent}
            />

            <StudentForm
              name={studentName}
              setName={setStudentName}
              level={studentLevel}
              setLevel={setStudentLevel}
              classType={classType}
              setClassType={setClassType}
              length={feedbackLength}
              setLength={setFeedbackLength}
              onSave={handleSaveStudentToList}
            />

            <SyllabusSelector
              library={syllabusLibrary}
              activeModule={activeModule}
              setActiveModule={setActiveModule}
              selectedTopics={selectedTopics}
              onToggle={toggleTopic}
              onAddCustom={handleAddCustomTopic}
            />

            <FeedbackInput
              highlights={selectedHighlights}
              setHighlights={setSelectedHighlights}
              selectedProblemTags={selectedProblemTags}
              setSelectedProblemTags={setSelectedProblemTags}
              selectedAbilityTags={selectedAbilityTags}
              setSelectedAbilityTags={setSelectedAbilityTags}
              notes={rawNotes}
              setNotes={setRawNotes}
              prevHw={prevHomework}
              setPrevHw={setPrevHomework}
              newHw={newHomework}
              setNewHw={setNewHomework}
              onGenerate={handleAIGenerate}
              isPolishing={isPolishing}
            />
          </div>
        ) : null}

        {activeTab === 'preview' ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
              <div className="relative flex items-center justify-between overflow-hidden bg-slate-800 p-4 text-white">
                <div className="relative z-10">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    {studentName || '学生姓名'}
                    <Edit3 className="h-3 w-3 opacity-50" />
                  </h2>
                  <p className="text-[10px] text-slate-300 opacity-80">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="relative z-10 text-right">
                  <div className="inline-block rounded bg-white/20 px-2 py-1 text-[10px] font-bold">CHEMISTRY</div>
                </div>
                <School className="absolute -bottom-4 -right-2 h-24 w-24 rotate-12 opacity-5" />
              </div>
              <div className="p-6">
                {polishedFeedback ? (
                  <>
                    <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-blue-500 opacity-70">
                      <MessageSquare className="h-3 w-3" /> 点击下方文字可直接修改
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={polishedFeedback}
                      onChange={(event) => {
                        setPolishedFeedback(event.target.value)
                        adjustTextareaHeight(event.target)
                      }}
                      className="w-full resize-none overflow-hidden border-none bg-transparent p-0 pb-10 text-sm leading-relaxed text-slate-700 outline-none ring-0"
                      spellCheck="false"
                    />
                  </>
                ) : (
                  <div className="py-10 text-center text-sm text-slate-400">生成内容为空，请返回重试</div>
                )}
                {newHomework ? (
                  <div className="mt-6 border-t border-dashed border-slate-200 pt-4">
                    <div className="mb-1 flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-bold uppercase text-slate-500">Homework</span>
                    </div>
                    <div className="rounded bg-blue-50 p-2 text-sm font-medium text-slate-800">{newHomework}</div>
                  </div>
                ) : null}
              </div>
              <div className="border-t border-slate-100 bg-slate-50 p-2 text-center">
                <span className="text-[10px] font-medium tracking-widest text-slate-400">百时教育 · 专注学业规划</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('input')}
                className="col-span-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-500"
              >
                返回修改
              </button>
              <button
                onClick={() => {
                  if (currentHistoryId) upsertHistoryStatus(currentHistoryId, 'sent')
                }}
                className="col-span-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 font-bold text-emerald-700"
              >
                <Send className="h-4 w-4" /> 已发送
              </button>
              <button
                onClick={copyToClipboard}
                className={`col-span-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-lg transition-all ${
                  copied ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? '已复制' : '一键复制'}
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === 'history' ? (
          <HistoryList
            records={filteredHistory}
            searchValue={historySearch}
            setSearchValue={setHistorySearch}
            statusFilter={historyStatusFilter}
            setStatusFilter={setHistoryStatusFilter}
            onView={(record) => applyRecordToForm(record, 'preview')}
            onReuse={(record) => applyRecordToForm(record, record.feedbackText ? 'preview' : 'input')}
            onMarkSent={(id) => upsertHistoryStatus(id, 'sent')}
            onDelete={handleDeleteHistoryRecord}
          />
        ) : null}
      </main>
    </div>
  )
}
