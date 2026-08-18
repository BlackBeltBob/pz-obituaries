import { useState } from 'react'

interface EditableMomentsProps {
  moments: string[]
  onChange: (moments: string[]) => void
}

export function EditableMoments({ moments, onChange }: EditableMomentsProps) {
  const [newMoment, setNewMoment] = useState('')

  function removeMoment(index: number) {
    onChange(moments.filter((_, i) => i !== index))
  }

  function addMoment() {
    const text = newMoment.trim()
    if (!text) return
    onChange([...moments, text])
    setNewMoment('')
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Memorable Moments</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {moments.map((moment, index) => (
          <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <span className="flex-1">{moment}</span>
            <button
              type="button"
              onClick={() => removeMoment(index)}
              className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Remove moment"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={newMoment}
          onChange={(e) => setNewMoment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addMoment()}
          placeholder="Add a memorable moment..."
          className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <button
          type="button"
          onClick={addMoment}
          className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Add
        </button>
      </div>
    </div>
  )
}
