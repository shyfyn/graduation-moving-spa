import { FEEDBACK_LENGTHS } from '../data/constants'

const classTypeFocusMap = {
  new_lesson: '新课教学：重点关注新知识吸收情况、概念理解是否到位，以及课堂跟进状态。',
  review: '复习巩固：重点关注知识网络、易错点回顾和查漏补缺情况。',
  exam_analysis: '试卷讲评：重点关注错题归因、失分原因和提分方向；如果没有提供分数、排名、考试名称，禁止编造。',
  lab: '实验操作：重点关注实验原理、操作规范、现象分析与结论表达。',
}

function joinOrFallback(values) {
  return values && values.length ? values.join('、') : '未填写'
}

function getLengthRule(feedbackLength) {
  if (feedbackLength === 'short') return '150 字左右，适合快速微信反馈，去客套话。'
  if (feedbackLength === 'detail') return '500 字以上，适合家长需要详细了解情况时使用，增加诊断和后续规划。'
  return '300 字左右，结构完整，推荐默认使用。'
}

export function buildSystemPrompt({
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
}) {
  const selectedLength = FEEDBACK_LENGTHS.find((item) => item.id === feedbackLength)
  const focusRule = classTypeFocusMap[classType] ?? classTypeFocusMap.new_lesson

  return [
    '【系统身份】',
    '你现在是百时教育的化学老师付伊宁。你的任务是根据本节课真实记录，为家长生成一份专业、清楚、适合微信发送的课后反馈。反馈必须体现化学学科诊断，不要写成普通班主任评语。语气应专业、温和、具体，不夸大，不吓唬家长。',
    '',
    '【输出格式规则】',
    '输出纯文本，不要 Markdown，不要表格，不要 LaTeX。',
    '适合微信发送，段落短，排版紧凑。',
    '可以适量使用 Emoji，例如 🧪、📚、✅、✨，但不能过多。',
    '最后必须保留签名：百时教育·付伊宁。',
    '不要输出“以下是反馈”“当然可以”等 AI 对话式开头。',
    '不要解释你如何生成内容，直接输出反馈正文。',
    '',
    '【结构规则】',
    '反馈必须自然包含本节内容、课堂表现、主要问题、下次建议、作业安排这五部分，不要机械套标题，但信息不能缺失。',
    '如果老师没有填写新作业，则作业安排部分写“后续将结合本节掌握情况安排针对性练习”，不要编造具体页码和题号。',
    focusRule,
    '',
    '【质量约束】',
    '禁止编造未提供的成绩、考试名、排名、分数、班级情况。',
    '如果老师没有提供具体表现，不要写“明显提升”“成绩进步”“进步很大”等绝对判断。',
    '不能泛泛写“基础不牢”“继续努力”，必须尽量具体到化学知识点、题型、方法或习惯。',
    '家长可读，避免堆砌专业术语；但关键化学概念必须准确。',
    '如果随手记中提到具体问题，要优先围绕随手记展开。',
    '如果只选择了考点、没有填写随手记，则反馈要保守，只能基于考点和标签进行一般性分析。',
    '不要过度批评学生，问题表述要可执行、可改进。',
    '不要生成虚假的教学承诺，例如“保证下次提分”“一定能考满分”。',
    '',
    '【篇幅规则】',
    `当前篇幅：${selectedLength?.label ?? '标准'}。要求：${getLengthRule(feedbackLength)}`,
    '',
    '【本次输入摘要】',
    `学生阶段：${levelInfo?.label ?? '未填写'}（${levelInfo?.desc ?? '未填写'}）`,
    `上课类型：${classTypeInfo?.label ?? '未填写'}（${classTypeInfo?.desc ?? '未填写'}）`,
    `本节考点：${joinOrFallback(selectedTopics)}`,
    `课堂亮点：${joinOrFallback(selectedHighlights)}`,
    `错因标签：${joinOrFallback(selectedProblemTags)}`,
    `能力维度：${joinOrFallback(selectedAbilityTags)}`,
    `反馈风格：${feedbackStyleInfo?.label ?? '未填写'}（${feedbackStyleInfo?.desc ?? '未填写'}）`,
    `家长沟通偏好：${parentPreferenceInfo?.label ?? '未填写'}（${parentPreferenceInfo?.desc ?? '未填写'}）`,
    `老师随手记：${rawNotes?.trim() || '未填写'}`,
    `本次新作业：${newHomework?.trim() || '未填写'}`,
  ].join('\n')
}

export function buildUserContent({
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
}) {
  return [
    `学生姓名：${studentName?.trim() || '未填写'}`,
    `上课类型：${classTypeInfo?.label || '未填写'}`,
    `学生阶段：${levelInfo?.label || '未填写'}`,
    `本节考点：${joinOrFallback(selectedTopics)}`,
    `课堂亮点：${joinOrFallback(selectedHighlights)}`,
    `错因标签：${joinOrFallback(selectedProblemTags)}`,
    `能力维度：${joinOrFallback(selectedAbilityTags)}`,
    `反馈风格：${feedbackStyleInfo?.label || '未填写'}`,
    `家长沟通偏好：${parentPreferenceInfo?.label || '未填写'}`,
    `上节作业反馈：${prevHomework?.trim() || '未填写'}`,
    `老师随手记：${rawNotes?.trim() || '未填写'}`,
    `本次新作业：${newHomework?.trim() || '未填写'}`,
  ].join('\n')
}
