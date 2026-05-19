export function createHistoryRecord({
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
}) {
  const now = new Date()
  const iso = now.toISOString()

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: iso,
    updatedAt: iso,
    dateLabel: now.toLocaleDateString(),
    studentName: studentName || '未命名学生',
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
    feedbackStyle: feedbackStyle || 'objective',
    parentPreference: parentPreference || 'detailed',
    status: 'generated',
  }
}

export function isSameDay(isoString, date = new Date()) {
  const value = new Date(isoString)
  return (
    value.getFullYear() === date.getFullYear() &&
    value.getMonth() === date.getMonth() &&
    value.getDate() === date.getDate()
  )
}

export function getLatestHistoryForStudent(history, studentName, date = new Date()) {
  return history.find((record) => record.studentName === studentName && isSameDay(record.createdAt, date)) ?? null
}

export function summarizeTopics(topics) {
  if (!topics?.length) return '未选择考点'
  if (topics.length <= 2) return topics.join('、')
  return `${topics.slice(0, 2).join('、')} 等 ${topics.length} 个考点`
}

export function getStatusLabel(status) {
  if (status === 'copied') return '已复制'
  if (status === 'sent') return '已发送'
  return '待发送'
}

export function getStatusTone(status) {
  if (status === 'copied') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (status === 'sent') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-blue-50 text-blue-700 border-blue-200'
}
