import { useState } from 'react'
import type { Goal } from '../../shared/obituary'

interface EditableGoalsProps {
  goals: Goal[]
  onChange: (goals: Goal[]) => void
}

export function EditableGoals({ goals, onChange }: EditableGoalsProps) {
  const [newGoal, setNewGoal] = useState('')

  function toggleGoal(index: number) {
    onChange(goals.map((g, i) => (i === index ? { ...g, achieved: !g.achieved } : g)))
  }

  function removeGoal(index: number) {
    onChange(goals.filter((_, i) => i !== index))
  }

  function addGoal() {
    const description = newGoal.trim()
    if (!description) return
    onChange([...goals, { description, achieved: false }])
    setNewGoal('')
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-100">Goals</h2>
      <ul className="mt-2 space-y-1">
        {goals.map((goal, index) => (
          <li key={index} className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => toggleGoal(index)}
              aria-label={goal.achieved ? 'Mark as not achieved' : 'Mark as achieved'}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                goal.achieved
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : 'border-slate-600 text-transparent'
              }`}
            >
              ✓
            </button>
            <span className={goal.achieved ? 'text-slate-300 line-through' : 'text-slate-300'}>
              {goal.description}
            </span>
            <button
              type="button"
              onClick={() => removeGoal(index)}
              className="ml-auto text-xs text-slate-500 hover:text-red-400"
              aria-label="Remove goal"
            >
              ✕
            </button>
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
          className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200"
        />
        <button
          type="button"
          onClick={addGoal}
          className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-600"
        >
          Add
        </button>
      </div>
    </div>
  )
}
