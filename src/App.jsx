import React, { useEffect, useRef, useState } from 'react'
import { School, Check, Copy, Edit3, MessageSquare, Save, X } from 'lucide-react'
import { INITIAL_SYLLABUS, STUDENT_LEVELS, FEEDBACK_LENGTHS, CLASS_TYPES } from './data/constants'
import StudentList from './components/StudentList'
import StudentForm from './components/StudentForm'
import SyllabusSelector from './components/SyllabusSelector'
import FeedbackInput from './components/FeedbackInput'

export default function ChemFeedbackApp() {
  const [activeTab, setActiveTab] = useState('input')
  const [savedStudents, setSavedStudents] = useState(() => JSON.parse(localStorage.getItem('my_students_list') || '[]'))
  const [syllabusLibrary, setSyllabusLibrary] = useState(() => {
    const saved = localStorage.getItem('my_syllabus_lib')
    return saved ? JSON.parse(saved) : INITIAL_SYLLABUS
  })
  const [studentName, setStudentName] = useState(() => localStorage.getItem('s_name') || '')
  const [studentLevel, setStudentLevel] = useState(() => localStorage.getItem('s_level') || 'improve')
  const [classType, setClassType] = useState(() => localStorage.getItem('s_classType') || 'new_lesson')
  const [activeModule, setActiveModule] = useState('必修一·基本概念')
  const [selectedTopics, setSelectedTopics] = useState(() => JSON.parse(localStorage.getItem('s_topics') || '[]'))
  const [selectedHighlights, setSelectedHighlights] = useState(() => JSON.parse(localStorage.getItem('s_highlights') || '[]'))
  const [prevHomework, setPrevHomework] = useState(() => localStorage.getItem('s_prevHw') || '完成不错')
  const [rawNotes, setRawNotes] = useState(() => localStorage.getItem('s_notes') || '')
  const [newHomework, setNewHomework] = useState(() => localStorage.getItem('s_newHw') || '')
  const [feedbackLength, setFeedbackLength] = useState(() => localStorage.getItem('s_length') || 'standard')
  const [polishedFeedback, setPolishedFeedback] = useState('')
  const [isPolishing, setIsPolishing] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef(null)

  const getApiKey = () => {
    try {
      return import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || ''
    } catch {
      return ''
    }
  }

  const apiKey = getApiKey()

  useEffect(() => {
    localStorage.setItem('my_students_list', JSON.stringify(savedStudents))
  }, [savedStudents])
  useEffect(() => {
    localStorage.setItem('my_syllabus_lib', JSON.stringify(syllabusLibrary))
  }, [syllabusLibrary])
  useEffect(() => {
    localStorage.setItem('s_name', studentName)
  }, [studentName])
  useEffect(() => {
    localStorage.setItem('s_level', studentLevel)
  }, [studentLevel])
  useEffect(() => {
    localStorage.setItem('s_classType', classType)
  }, [classType])
  useEffect(() => {
    localStorage.setItem('s_length', feedbackLength)
  }, [feedbackLength])
  useEffect(() => {
    localStorage.setItem('s_topics', JSON.stringify(selectedTopics))
  }, [selectedTopics])
  useEffect(() => {
    localStorage.setItem('s_highlights', JSON.stringify(selectedHighlights))
  }, [selectedHighlights])
  useEffect(() => {
    localStorage.setItem('s_prevHw', prevHomework)
  }, [prevHomework])
  useEffect(() => {
    localStorage.setItem('s_notes', rawNotes)
  }, [rawNotes])
  useEffect(() => {
    localStorage.setItem('s_newHw', newHomework)
  }, [newHomework])

  const handleSaveStudentToList = () => {
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

  const handleLoadStudent = (student) => {
    if (studentName && studentName !== student.name && (rawNotes || selectedTopics.length > 0)) {
      if (!confirm(`确定切换到【${student.name}】吗？`)) return
    }
    setStudentName(student.name)
    setStudentLevel(student.level || 'improve')
  }

  const handleDeleteStudent = (event, name) => {
    event.stopPropagation()
    if (confirm(`确定删除【${name}】吗？`)) {
      setSavedStudents(savedStudents.filter((student) => student.name !== name))
    }
  }

  const handleAddCustomTopic = (topic, setInput) => {
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

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic]))
  }

  const clearAll = () => {
    if (confirm('确定清空？')) {
      setStudentName('')
      setSelectedTopics([])
      setSelectedHighlights([])
      setRawNotes('')
      setNewHomework('')
      setPolishedFeedback('')
    }
  }

  const adjustTextareaHeight = (element, buffer = 24) => {
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight + buffer}px`
  }

  useEffect(() => {
    if (activeTab === 'preview' && textareaRef.current) {
      adjustTextareaHeight(textareaRef.current)
    }
  }, [polishedFeedback, activeTab])

  const handleAIGenerate = async () => {
    if (!studentName) {
      alert('请填写学生姓名')
      return
    }
    if (selectedTopics.length === 0 && !rawNotes) {
      alert('请至少选择一个知识点或填写一些随手记')
      return
    }
    if (!apiKey) {
      alert('缺少 API Key，请配置 VITE_DEEPSEEK_API_KEY。')
      return
    }

    setIsPolishing(true)

    try {
      const levelInfo = STUDENT_LEVELS.find((level) => level.id === studentLevel)
      const classTypeInfo = CLASS_TYPES.find((type) => type.id === classType)
      let lengthInfo = ''
      if (feedbackLength === 'short') lengthInfo = '篇幅精简，150字左右，去客套话。'
      if (feedbackLength === 'standard') lengthInfo = '篇幅适中，300字左右。'
      if (feedbackLength === 'detail') lengthInfo = '篇幅详细，500字以上，深入分析。'

      let structurePrompt = ''
      if (classType === 'new_lesson') {
        structurePrompt = '写作结构：1.简述今日新知；2.学情诊断（重点分析课堂吸收情况）；3.亮点与不足；4.作业规划。'
      } else if (classType === 'review') {
        structurePrompt = '写作结构：1.简述复习模块；2.学情诊断（重点分析知识网络构建情况）；3.查漏补缺建议；4.作业规划。'
      } else if (classType === 'exam_analysis') {
        structurePrompt = '写作结构：1.试卷概况；2.错题归因（重点分析知识漏洞还是解题习惯）；3.提分建议；4.针对性训练作业。'
      } else {
        structurePrompt = '写作结构：1.今日内容；2.学情诊断；3.亮点与建议；4.作业规划。'
      }

      const systemPrompt = `你现在是百时教育的化学老师付伊宁。
你的任务是根据学生本节课的学习内容，生成一份发给家长的专业反馈。

【核心原则】：
1. 纯文本：禁止 Markdown/LaTeX。
2. 紧凑排版：适合微信。
3. 智能表情：适量使用 Emoji (🧪, 📚, ✨, ✅) 点缀。

【学生阶段】：${levelInfo?.label} (${levelInfo?.desc})。
【上课类型】：${classTypeInfo?.label} (${classTypeInfo?.desc})。
【篇幅要求】：${lengthInfo}

【${structurePrompt}】

【学情诊断】：这是重点。结合老师在“随手记”中提供的问题（如“${rawNotes}”），进行深度剖析。

【签名】：
百时教育·付伊宁`

      const userContent = `学生：${studentName}，类型：${classTypeInfo?.label}，考点：${selectedTopics.join('、')}，亮点：${selectedHighlights.join('、')}，上节作业：${prevHomework}，老师深度笔记：${rawNotes}，新作业：${newHomework}`

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

      if (result) {
        setPolishedFeedback(result.trim())
        setActiveTab('preview')
      } else {
        alert('生成失败，请检查 API Key。')
      }
    } catch {
      alert('网络连接失败，请检查网络。')
    } finally {
      setIsPolishing(false)
    }
  }

  const copyToClipboard = async () => {
    const text = polishedFeedback + (newHomework ? `\n\n📝 【本次作业】：\n${newHomework}` : '')
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
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
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('复制失败')
    }
    document.body.removeChild(textArea)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-sans text-slate-800">
      <div className="sticky top-0 z-30 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-blue-800">
            <School className="h-6 w-6" />
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">百时教育</span>
              <span className="text-[10px] leading-tight text-slate-500">ChemFeedback Pro</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'input' && (studentName || rawNotes) && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-500 shadow-sm"
              >
                <X className="h-3 w-3" /> 清空
              </button>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">付伊宁老师</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-xl space-y-4 p-4">
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
        ) : (
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
                {newHomework && (
                  <div className="mt-6 border-t border-dashed border-slate-200 pt-4">
                    <div className="mb-1 flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-bold uppercase text-slate-500">Homework</span>
                    </div>
                    <div className="rounded bg-blue-50 p-2 text-sm font-medium text-slate-800">{newHomework}</div>
                  </div>
                )}
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
                onClick={copyToClipboard}
                className={`col-span-2 flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-lg transition-all ${
                  copied ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? '已复制' : '一键复制发送'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
