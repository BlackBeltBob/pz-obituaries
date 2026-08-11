import { useState } from 'react'
import type { Routine } from '../../shared/obituary'

interface RoutinesListProps {
  routines: Routine[]
  currentDay: number | null
  onChange: (routines: Routine[]) => void
}

export function RoutinesList({ routines, currentDay, onChange }: RoutinesListProps) {
  const [description, setDescription] = useState('')
  const [cadence, setCadence] = useState('')

  function addRoutine() {
    const desc = description.trim()
    if (!desc) return
    const routine: Routine = {
      id: crypto.randomUUID(),
      description: desc,
      cadence: cadence.trim() || 'Recurring',
      done: false,
      lastDoneDay: null,
    }
    onChange([...routines, routine])
    setDescription('')
    setCadence('')
  }

  function removeRoutine(id: string) {
    onChange(routines.filter((r) => r.id !== id))
  }

  function markDone(id: string) {
    onChange(routines.map((r) => (r.id === id ? { ...r, done: true, lastDoneDay: currentDay } : r)))
  }

  function resetRoutine(id: string) {
    onChange(routines.map((r) => (r.id === id ? { ...r, done: false } : r)))
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-100">Routines</h2>
      <ul className="mt-2 space-y-1.5">
        {routines.map((routine) => (
          <li key={routine.id} className="flex items-start gap-2 rounded border border-slate-800 px-2 py-1.5">
            <button
              type="button"
              onClick={() => (routine.done ? resetRoutine(routine.id) : markDone(routine.id))}
              aria-label={routine.done ? 'Reset for next cycle' : 'Mark done'}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                routine.done
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : 'border-slate-600 text-transparent'
              }`}
            >
              ✓
            </button>
            <div className="flex-1">
              <span className={`text-sm ${routine.done ? 'text-slate-300 line-through' : 'text-slate-300'}`}>
                {routine.description}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-800 px-2 py-0.5">{routine.cadence}</span>
                {routine.lastDoneDay !== null && <span>Last done: day {routine.lastDoneDay}</span>}
                {routine.done && (
                  <button type="button" onClick={() => resetRoutine(routine.id)} className="hover:text-slate-300">
                    Reset for next cycle
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRoutine(routine.id)}
              className="text-xs text-slate-500 hover:text-red-400"
              aria-label="Remove routine"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addRoutine()}
          placeholder="Add a recurring task..."
          className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200"
        />
        <input
          type="text"
          value={cadence}
          onChange={(e) => setCadence(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addRoutine()}
          placeholder="Cadence (e.g. Daily)"
          className="w-32 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200"
        />
        <button
          type="button"
          onClick={addRoutine}
          className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-600"
        >
          Add
        </button>
      </div>
    </div>
  )
}
