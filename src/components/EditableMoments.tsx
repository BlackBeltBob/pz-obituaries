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
      <h2 className="text-lg font-semibold text-slate-100">Memorable Moments</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {moments.map((moment, index) => (
          <li key={index} className="flex items-start gap-2 text-slate-300">
            <span className="flex-1">{moment}</span>
            <button
              type="button"
              onClick={() => removeMoment(index)}
              className="text-xs text-slate-500 hover:text-red-400"
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
          className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200"
        />
        <button
          type="button"
          onClick={addMoment}
          className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-600"
        >
          Add
        </button>
      </div>
    </div>
  )
}
