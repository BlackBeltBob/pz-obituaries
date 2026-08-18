import { useState } from 'react'
import type { Goal } from '../../shared/obituary'

interface EditableGoalsProps {
  goals: Goal[]
  onChange: (goals: Goal[]) => void
}

export function EditableGoals({ goals, onChange }: EditableGoalsProps) {
  const [newGoal, setNewGoal] = useState('')
  const [newTag, setNewTag] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  function toggleGoal(index: number) {
    onChange(goals.map((g, i) => (i === index ? { ...g, achieved: !g.achieved } : g)))
  }

  function removeGoal(index: number) {
    onChange(goals.filter((_, i) => i !== index))
  }

  function addGoal() {
    const description = newGoal.trim()
    if (!description) return
    const tag = newTag.trim()
    onChange([...goals, { description, achieved: false, ...(tag && { tag }) }])
    setNewGoal('')
    setNewTag('')
  }

  function startEditing(index: number) {
    setEditingIndex(index)
    setEditText(goals[index].description)
  }

  function commitEdit(index: number) {
    const description = editText.trim()
    if (description) {
      onChange(goals.map((g, i) => (i === index ? { ...g, description } : g)))
    }
    setEditingIndex(null)
  }

  function moveGoal(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= goals.length) return
    const reordered = [...goals]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    onChange(reordered)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Goals</h2>
      <ul className="mt-2 space-y-1">
        {goals.map((goal, index) => (
          <li key={index} className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => toggleGoal(index)}
              aria-label={goal.achieved ? 'Mark as not achieved' : 'Mark as achieved'}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                goal.achieved
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-300 text-transparent dark:border-slate-600'
              }`}
            >
              ✓
            </button>
            {editingIndex === index ? (
              <input
                autoFocus
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => commitEdit(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit(index)
                  if (e.key === 'Escape') setEditingIndex(null)
                }}
                className="flex-1 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            ) : (
              <span
                onClick={() => startEditing(index)}
                className={`flex-1 cursor-text ${goal.achieved ? 'text-slate-600 line-through dark:text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}
                title="Click to edit"
              >
                {goal.description}
              </span>
            )}
            {goal.tag && (
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {goal.tag}
              </span>
            )}
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => moveGoal(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 dark:hover:text-slate-300"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveGoal(index, 1)}
                disabled={index === goals.length - 1}
                aria-label="Move down"
                className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 dark:hover:text-slate-300"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeGoal(index)}
                className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                aria-label="Remove goal"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Add a goal..."
          className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Tag (optional)"
          className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <button
          type="button"
          onClick={addGoal}
          className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Add
        </button>
      </div>
    </div>
  )
}
