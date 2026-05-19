import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  School,
  Check,
  Copy,
  Edit3,
  MessageSquare,
  Save,
  X,
  LayoutGrid,
  PenSquare,
  History,
  Send,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import {
  INITIAL_SYLLABUS,
  STUDENT_LEVELS,
  CLASS_TYPES,
  FEEDBACK_STYLES,
  PARENT_PREFERENCES,
  HISTORY_DATE_OPTIONS,
  REWRITE_OPTIONS,
} from './data/constants'
import StudentList from './components/StudentList'
import StudentForm from './components/StudentForm'
import SyllabusSelector from './components/SyllabusSelector'
import FeedbackInput from './components/FeedbackInput'
import Dashboard from './components/Dashboard'
import HistoryList from './components/HistoryList'
import { safeReadJson, safeReadText, safeWriteJson, safeWriteText } from './utils/storage'
import { buildSystemPrompt, buildUserContent } from './utils/promptBuilder'
import { createHistoryRecord, getStatusLabel } from './utils/history'

function daysDiffFromNow(isoString) {
  const now = new Date()
  const value = new Date(isoString)
  const diffMs = now.setHours(0, 0, 0, 0) - value.setHours(0, 0, 0, 0)
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

function parseJsonFromText(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

export default function ChemFeedbackApp() {
  const bannedPhraseSuggestions = {
    很差: '课堂掌握还不稳定',
    太差: '当前基础还需要继续补强',
    完全不会: '对相关知识点还不够熟悉',
    不认真: '课堂专注度还需要进一步稳定',
    不努力: '课后落实还需要进一步加强',
    问题严重: '当前问题相对集中，需要分步骤调整',
    基础太烂: '基础环节还比较薄弱，需要回到核心概念重新梳理',
  }
  const vaguePhrases = ['继续努力', '基础还需加强', '认真完成作业', '查漏补缺', '基础不牢']

  const [activeTab, setActiveTab] = useState('dashboard')
  const [savedStudents, setSavedStudents] = useState(() => safeReadJson('my_students_list', []))
  const [syllabusLibrary, setSyllabusLibrary] = useState(() => safeReadJson('my_syllabus_lib', INITIAL_SYLLABUS) || INITIAL_SYLLABUS)
  const [studentName, setStudentName] = useState(() => safeReadText('s_name'))
  const [studentLevel, setStudentLevel] = useState(() => safeReadText('s_level', 'improve'))
  const [classType, setClassType] = useState(() => safeReadText('s_classType', 'new_lesson'))
  const [feedbackStyle, setFeedbackStyle] = useState(() => safeReadText('s_feedback_style', 'professional'))
  const [parentPreference, setParentPreference] = useState(() => safeReadText('s_parent_preference', 'detailed'))
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
  const [isRewriting, setIsRewriting] = useState(false)
  const [isParsingNotes, setIsParsingNotes] = useState(false)
  const [currentHistoryId, setCurrentHistoryId] = useState(null)
  const [historySearch, setHistorySearch] = useState('')
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all')
  const [historyDateFilter, setHistoryDateFilter] = useState('30d')
  const [historyViewMode, setHistoryViewMode] = useState('timeline')
  const [copyAppendHomework, setCopyAppendHomework] = useState(() => safeReadJson('s_copy_append_homework', false))
  const [carryoverTopic, setCarryoverTopic] = useState('')
  const [statusToast, setStatusToast] = useState(null)
  const textareaRef = useRef(null)

  const levelInfo = STUDENT_LEVELS.find((level) => level.id === studentLevel)
  const classTypeInfo = CLASS_TYPES.find((type) => type.id === classType)
  const feedbackStyleInfo = FEEDBACK_STYLES.find((item) => item.id === feedbackStyle)
  const parentPreferenceInfo = PARENT_PREFERENCES.find((item) => item.id === parentPreference)
  const isStudentSaved = savedStudents.some((student) => student.name === studentName.trim())

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
    safeWriteText('s_feedback_style', feedbackStyle)
  }, [feedbackStyle])

  useEffect(() => {
    safeWriteText('s_parent_preference', parentPreference)
  }, [parentPreference])

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
    safeWriteJson('s_copy_append_homework', copyAppendHomework)
  }, [copyAppendHomework])

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

  useEffect(() => {
    if (!carryoverTopic) return
    const timer = window.setTimeout(() => setCarryoverTopic(''), 2000)
    return () => window.clearTimeout(timer)
  }, [carryoverTopic])

  useEffect(() => {
    if (!statusToast) return
    const timer = window.setTimeout(() => setStatusToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [statusToast])

  const recentTopics = useMemo(() => {
    return Array.from(
      new Set(
        feedbackHistory
          .flatMap((record) => record.selectedTopics || [])
          .reverse(),
      ),
    )
      .reverse()
      .slice(-6)
      .reverse()
  }, [feedbackHistory])

  const filteredHistory = useMemo(() => {
    return feedbackHistory.filter((record) => {
      const searchTarget = [
        record.studentName,
        ...(record.selectedTopics || []),
        ...(record.selectedProblemTags || []),
        ...(record.selectedAbilityTags || []),
        record.rawNotes,
        record.newHomework,
        record.feedbackText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const query = historySearch.trim().toLowerCase()
      const matchesSearch = !query || searchTarget.includes(query)
      const matchesStatus = historyStatusFilter === 'all' || record.status === historyStatusFilter
      const days = daysDiffFromNow(record.createdAt)
      const matchesDate =
        historyDateFilter === 'all' ||
        (historyDateFilter === 'today' && days === 0) ||
        (historyDateFilter === '7d' && days >= 0 && days < 7) ||
        (historyDateFilter === '30d' && days >= 0 && days < 30)

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [feedbackHistory, historySearch, historyStatusFilter, historyDateFilter])

  const historyByStudent = useMemo(() => {
    return Array.from(
      filteredHistory.reduce((map, record) => {
        const key = record.studentName || '未命名学生'
        const current = map.get(key) || []
        current.push(record)
        map.set(key, current)
        return map
      }, new Map()),
    ).map(([studentNameValue, records]) => ({
      studentName: studentNameValue,
      count: records.length,
      latestAt: records[0]?.createdAt,
      records,
    }))
  }, [filteredHistory])

  const hasInputContent =
    studentName.trim() ||
    rawNotes.trim() ||
    newHomework.trim() ||
    selectedTopics.length ||
    selectedHighlights.length ||
    selectedProblemTags.length ||
    selectedAbilityTags.length

  const currentHistoryRecord = currentHistoryId
    ? feedbackHistory.find((record) => record.id === currentHistoryId) || null
    : null

  const currentHistoryStatus = currentHistoryRecord?.status || null
  const feedbackWarnings = useMemo(() => {
    const hardWarnings = Object.entries(bannedPhraseSuggestions)
      .filter(([phrase]) => polishedFeedback.includes(phrase))
      .map(([phrase, suggestion]) => ({ type: 'hard', phrase, suggestion }))
    const vagueWarnings = vaguePhrases
      .filter((phrase) => polishedFeedback.includes(phrase))
      .map((phrase) => ({ type: 'vague', phrase, suggestion: '建议具体到化学考点、题型、方法或课堂表现。' }))
    return [...hardWarnings, ...vagueWarnings]
  }, [polishedFeedback])

  function adjustTextareaHeight(element, buffer = 24) {
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight + buffer}px`
  }

  async function requestDeepSeek(messages) {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: false,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || '请求失败')
    }

    return data.choices?.[0]?.message?.content?.trim() || ''
  }

  function handleSaveStudentToList() {
    if (!studentName.trim()) {
      alert('请先输入学生姓名。')
      return
    }

    const existingIndex = savedStudents.findIndex((student) => student.name === studentName.trim())
    const nextList = [...savedStudents]

    if (existingIndex >= 0) {
      nextList[existingIndex] = { name: studentName.trim(), level: studentLevel }
      alert(`已更新【${studentName.trim()}】信息。`)
    } else {
      nextList.push({ name: studentName.trim(), level: studentLevel })
      alert(`已保存【${studentName.trim()}】到常用学生。`)
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
    if (!confirm('确定清空当前输入内容吗？')) return
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
    setCarryoverTopic('')
  }

  function updateHistoryRecord(id, updater) {
    setFeedbackHistory((prev) =>
      prev.map((record) => {
        if (record.id !== id) return record
        const patch = typeof updater === 'function' ? updater(record) : updater
        return { ...record, ...patch, updatedAt: new Date().toISOString() }
      }),
    )
  }

  function markSentWithUndo(id) {
    const target = feedbackHistory.find((record) => record.id === id)
    if (!target) return
    const previousStatus = target.status
    updateHistoryRecord(id, { status: 'sent' })
    setStatusToast({ id, previousStatus, message: '已标记发送' })
  }

  function undoSentMark() {
    if (!statusToast) return
    updateHistoryRecord(statusToast.id, { status: statusToast.previousStatus })
    setStatusToast(null)
  }

  function applyRecordToForm(record, targetTab = null) {
    setStudentName(record.studentName || '')
    setStudentLevel(record.studentLevel || 'improve')
    setClassType(record.classType || 'new_lesson')
    setFeedbackStyle(record.feedbackStyle || 'professional')
    setParentPreference(record.parentPreference || 'detailed')
    setSelectedTopics(record.selectedTopics || [])
    setSelectedHighlights(record.selectedHighlights || [])
    setSelectedProblemTags(record.selectedProblemTags || [])
    setSelectedAbilityTags(record.selectedAbilityTags || [])
    setPrevHomework(record.prevHomework || '')
    setRawNotes(record.rawNotes || '')
    setNewHomework(record.newHomework || '')
    setPolishedFeedback(record.feedbackText || '')
    setCurrentHistoryId(record.id)
    setActiveTab(targetTab || (record.feedbackText ? 'preview' : 'input'))
  }

  function startNewFeedback(student = null) {
    if (student) {
      setStudentName(student.name || '')
      setStudentLevel(student.level || 'improve')
    }
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
    }
  }

  function buildCopyPayload(feedbackText, homeworkText) {
    const base = feedbackText.trim()
    if (!copyAppendHomework || !homeworkText.trim()) return base
    if (base.includes(homeworkText.trim())) return base
    return `${base}\n\n📝 【本次作业】\n${homeworkText.trim()}`
  }

  async function writeClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }

    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }

  async function copyToClipboard(record = null) {
    const targetRecord = record || currentHistoryRecord || {
      feedbackText: polishedFeedback,
      newHomework,
      id: currentHistoryId,
    }

    const text = buildCopyPayload(targetRecord.feedbackText || '', targetRecord.newHomework || '')
    if (!text.trim()) {
      alert('当前没有可复制的反馈内容。')
      return
    }

    try {
      await writeClipboard(text)
      if (targetRecord.id) {
        updateHistoryRecord(targetRecord.id, { status: 'copied' })
      }
      if (!record && currentHistoryId) {
        setCurrentHistoryId(currentHistoryId)
      }
      setStatusToast({ message: '已复制到剪贴板' })
    } catch {
      alert('复制失败，请重试。')
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
        feedbackStyleInfo,
        parentPreferenceInfo,
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
        feedbackStyleInfo,
        parentPreferenceInfo,
      })

      const feedbackText = await requestDeepSeek([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ])

      if (!feedbackText) {
        alert('生成失败，请检查 API Key 或稍后重试。')
        return
      }

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
        feedbackStyle,
        parentPreference,
      })

      setPolishedFeedback(feedbackText)
      setCurrentHistoryId(nextRecord.id)
      setFeedbackHistory((prev) => [nextRecord, ...prev].slice(0, 200))
      setActiveTab('preview')
    } catch (error) {
      alert(error.message || '网络连接失败，请检查网络。')
    } finally {
      setIsPolishing(false)
    }
  }

  async function handleRewriteFeedback(optionId) {
    const option = REWRITE_OPTIONS.find((item) => item.id === optionId)
    if (!option || !polishedFeedback.trim()) return
    if (!apiKey) {
      alert('缺少 API Key，请配置 VITE_DEEPSEEK_API_KEY。')
      return
    }

    setIsRewriting(true)

    try {
      const rewritten = await requestDeepSeek([
        {
          role: 'system',
          content:
            '你是百时教育的化学老师付伊宁。你只能在不改变事实、不新增成绩排名、不编造细节的前提下改写反馈。输出纯文本，保留原有学科准确性和签名。',
        },
        {
          role: 'user',
          content: `${option.instruction}\n\n原反馈如下：\n${polishedFeedback}`,
        },
      ])

      if (rewritten) {
        setPolishedFeedback(rewritten)
      }
    } catch (error) {
      alert(error.message || '改写失败，请稍后重试。')
    } finally {
      setIsRewriting(false)
    }
  }

  async function handleParseNotes() {
    if (!rawNotes.trim()) {
      alert('请先输入或口述随手记，再进行解析。')
      return
    }
    if (!apiKey) {
      alert('缺少 API Key，请配置 VITE_DEEPSEEK_API_KEY。')
      return
    }

    setIsParsingNotes(true)

    try {
      const availableTopics = Object.values(syllabusLibrary).flat().join('、')
      const availableProblemTags = selectedProblemTags.join('、')
      const availableAbilityTags = selectedAbilityTags.join('、')
      const result = await requestDeepSeek([
        {
          role: 'system',
          content:
            '你是教学助理。请把老师口述整理成 JSON。只输出 JSON，不要解释。字段固定为 studentName, topics, problemTags, abilityTags, homework, notes。topics/problemTags/abilityTags 必须是数组；没有就输出空数组。',
        },
        {
          role: 'user',
          content: `老师随手记：${rawNotes}\n当前学生：${studentName || '未填写'}\n可参考考点库：${availableTopics}\n当前已选错因标签：${availableProblemTags || '无'}\n当前已选能力维度：${availableAbilityTags || '无'}`,
        },
      ])

      const parsed = parseJsonFromText(result)
      if (!parsed) {
        alert('解析失败，请稍后重试。')
        return
      }

      if (parsed.studentName && !studentName.trim()) {
        setStudentName(parsed.studentName)
      }
      if (Array.isArray(parsed.topics) && parsed.topics.length) {
        setSelectedTopics((prev) => Array.from(new Set([...prev, ...parsed.topics])))
      }
      if (Array.isArray(parsed.problemTags) && parsed.problemTags.length) {
        setSelectedProblemTags((prev) => Array.from(new Set([...prev, ...parsed.problemTags])))
      }
      if (Array.isArray(parsed.abilityTags) && parsed.abilityTags.length) {
        setSelectedAbilityTags((prev) => Array.from(new Set([...prev, ...parsed.abilityTags])))
      }
      if (parsed.homework) {
        setNewHomework((prev) => prev || parsed.homework)
      }
      if (parsed.notes) {
        setRawNotes(parsed.notes)
      }

      setStatusToast({ message: '已按结构化字段整理口述内容' })
    } catch (error) {
      alert(error.message || '解析失败，请稍后重试。')
    } finally {
      setIsParsingNotes(false)
    }
  }

  const navItems = [
    { id: 'dashboard', label: '工作台', icon: LayoutGrid },
    { id: 'input', label: '写反馈', icon: PenSquare },
    { id: 'history', label: '历史', icon: History },
  ]

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
              setCarryoverTopic(topic)
              setActiveTab('input')
            }}
            onMarkSent={(id) => markSentWithUndo(id)}
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
              feedbackStyle={feedbackStyle}
              setFeedbackStyle={setFeedbackStyle}
              parentPreference={parentPreference}
              setParentPreference={setParentPreference}
              onSave={handleSaveStudentToList}
              isStudentSaved={isStudentSaved}
            />

            <SyllabusSelector
              library={syllabusLibrary}
              activeModule={activeModule}
              setActiveModule={setActiveModule}
              selectedTopics={selectedTopics}
              recentTopics={recentTopics}
              onToggle={toggleTopic}
              onAddCustom={handleAddCustomTopic}
              carryoverTopic={carryoverTopic}
            />

            <FeedbackInput
              studentName={studentName}
              selectedTopics={selectedTopics}
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
              onParseNotes={handleParseNotes}
              isPolishing={isPolishing}
              isParsingNotes={isParsingNotes}
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
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {REWRITE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleRewriteFeedback(option.id)}
                      disabled={isRewriting || isPolishing || !polishedFeedback.trim()}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isRewriting || isPolishing}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    重新生成
                  </button>
                </div>
                {isRewriting ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> 正在按要求改写反馈
                  </div>
                ) : null}
              </div>
              <div className="p-6">
                {polishedFeedback ? (
                  <>
                    <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-blue-500 opacity-70">
                      <MessageSquare className="h-3 w-3" /> 点击下方文字可直接修改
                    </div>
                    {feedbackWarnings.length ? (
                      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                        <div className="font-semibold">生成后检查</div>
                        <div className="mt-2 space-y-1">
                          {feedbackWarnings.map((warning) => (
                            <div key={`${warning.type}-${warning.phrase}`}>
                              检测到“{warning.phrase}”：
                              {warning.suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
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
                <label className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={copyAppendHomework}
                    onChange={(event) => setCopyAppendHomework(event.target.checked)}
                    className="rounded border-slate-300"
                  />
                  复制时单独附加作业
                </label>
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
                  if (currentHistoryId && confirm('确认已发给家长？')) {
                    markSentWithUndo(currentHistoryId)
                  }
                }}
                className="col-span-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 font-bold text-emerald-700"
              >
                <Send className="h-4 w-4" /> 确认已发给家长
              </button>
              <button
                onClick={() => copyToClipboard()}
                className="col-span-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700"
              >
                <Copy className="h-4 w-4" />
                {currentHistoryStatus === 'generated' || !currentHistoryStatus ? '一键复制' : '再次复制'}
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === 'history' ? (
          <HistoryList
            records={filteredHistory}
            groupedRecords={historyByStudent}
            searchValue={historySearch}
            setSearchValue={setHistorySearch}
            statusFilter={historyStatusFilter}
            setStatusFilter={setHistoryStatusFilter}
            dateFilter={historyDateFilter}
            setDateFilter={setHistoryDateFilter}
            dateOptions={HISTORY_DATE_OPTIONS}
            viewMode={historyViewMode}
            setViewMode={setHistoryViewMode}
            onView={(record) => applyRecordToForm(record, 'preview')}
            onReuse={(record) => applyRecordToForm(record, record.feedbackText ? 'preview' : 'input')}
            onMarkSent={(id) => markSentWithUndo(id)}
            onDelete={handleDeleteHistoryRecord}
            onDirectCopy={copyToClipboard}
          />
        ) : null}
      </main>

      {statusToast ? (
        <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <span>{statusToast.message}</span>
          {statusToast.id ? (
            <button type="button" onClick={undoSentMark} className="inline-flex items-center gap-1 font-semibold text-amber-300">
              <RotateCcw className="h-3.5 w-3.5" /> 撤销
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
