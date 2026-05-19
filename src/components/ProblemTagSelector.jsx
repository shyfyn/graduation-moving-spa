import { ABILITY_CATEGORIES, PROBLEM_CATEGORIES } from '../data/constants'

function TagCategoryBlock({ title, categories, selectedValues, onToggle, tone }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-[11px] text-slate-500">点击即可加入诊断维度，再点一次可取消。</p>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-white/70 bg-white/85 p-3">
            <div className="mb-2">
              <p className="text-sm font-semibold text-slate-700">{category.label}</p>
              <p className="text-[11px] leading-5 text-slate-500">{category.desc}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.tags.map((tag) => {
                const selected = selectedValues.includes(tag.label)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    title={tag.example}
                    onClick={() => onToggle(tag.label)}
                    className={`rounded-2xl border px-3 py-2 text-left transition-all ${
                      selected ? tone.selected : tone.idle
                    }`}
                  >
                    <div className="text-xs font-semibold">{tag.label}</div>
                    <div className="mt-0.5 max-w-[180px] text-[10px] leading-4 opacity-80">{tag.example}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProblemTagSelector({
  selectedProblemTags,
  setSelectedProblemTags,
  selectedAbilityTags,
  setSelectedAbilityTags,
}) {
  const toggleProblemTag = (value) => {
    setSelectedProblemTags((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const toggleAbilityTag = (value) => {
    setSelectedAbilityTags((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  return (
    <div className="space-y-4">
      <TagCategoryBlock
        title="错因标签"
        categories={PROBLEM_CATEGORIES}
        selectedValues={selectedProblemTags}
        onToggle={toggleProblemTag}
        tone={{
          selected: 'border-orange-300 bg-orange-50 text-orange-700 shadow-sm',
          idle: 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/50',
        }}
      />
      <TagCategoryBlock
        title="能力维度"
        categories={ABILITY_CATEGORIES}
        selectedValues={selectedAbilityTags}
        onToggle={toggleAbilityTag}
        tone={{
          selected: 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm',
          idle: 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50',
        }}
      />
    </div>
  )
}
