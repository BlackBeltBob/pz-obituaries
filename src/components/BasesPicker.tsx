import { useState } from 'react'
import type { Base } from '../../shared/obituary'

interface BasesPickerProps {
  bases: Base[]
  selectedBaseId: string | null
  onChange: (update: { bases?: Base[]; selectedBaseId?: string | null }) => void
}

function mapUrl(base: Base): string {
  return `https://map.projectzomboid.com/?${base.x}x${base.y}`
}

export function BasesPicker({ bases, selectedBaseId, onChange }: BasesPickerProps) {
  const [label, setLabel] = useState('')
  const [x, setX] = useState('')
  const [y, setY] = useState('')

  const selected = bases.find((b) => b.id === selectedBaseId) ?? null

  function addBase() {
    const trimmedLabel = label.trim()
    const parsedX = Number(x)
    const parsedY = Number(y)
    if (!trimmedLabel || !x.trim() || !y.trim() || Number.isNaN(parsedX) || Number.isNaN(parsedY)) return
    const base: Base = { id: crypto.randomUUID(), label: trimmedLabel, x: parsedX, y: parsedY }
    onChange({
      bases: [...bases, base],
      ...(selectedBaseId === null && { selectedBaseId: base.id }),
    })
    setLabel('')
    setX('')
    setY('')
  }

  function removeBase(id: string) {
    const remaining = bases.filter((b) => b.id !== id)
    onChange({
      bases: remaining,
      ...(selectedBaseId === id && { selectedBaseId: remaining[0]?.id ?? null }),
    })
  }

  function moveBase(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= bases.length) return
    const reordered = [...bases]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    onChange({ bases: reordered })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bases</h2>

      {selected && (
        <div className="mt-2 overflow-hidden rounded border border-slate-200 dark:border-slate-800">
          <iframe
            key={selected.id}
            src={mapUrl(selected)}
            title={`Map preview of ${selected.label}`}
            className="h-80 w-full border-0"
            loading="lazy"
          />
        </div>
      )}

      <ul className="mt-2 space-y-1">
        {bases.map((base, index) => (
          <li
            key={base.id}
            className="flex items-center gap-2 rounded border border-slate-200 px-2 py-1.5 dark:border-slate-800"
          >
            <input
              type="radio"
              name="selected-base"
              checked={base.id === selectedBaseId}
              onChange={() => onChange({ selectedBaseId: base.id })}
              aria-label={`Preview ${base.label}`}
              className="h-4 w-4 shrink-0 accent-emerald-600"
            />
            <span className="flex-1 text-sm text-slate-600 dark:text-slate-200">{base.label}</span>
            <span className="shrink-0 text-xs text-slate-500">
              {base.x}, {base.y}
            </span>
            <a
              href={mapUrl(base)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs text-emerald-600 hover:underline dark:text-emerald-400"
            >
              View on map
            </a>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => moveBase(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 dark:hover:text-slate-300"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBase(index, 1)}
                disabled={index === bases.length - 1}
                aria-label="Move down"
                className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 dark:hover:text-slate-300"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBase(base.id)}
                className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                aria-label="Remove base"
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
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addBase()}
          placeholder="Base name..."
          className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <input
          type="number"
          value={x}
          onChange={(e) => setX(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addBase()}
          placeholder="X"
          className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <input
          type="number"
          value={y}
          onChange={(e) => setY(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addBase()}
          placeholder="Y"
          className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <button
          type="button"
          onClick={addBase}
          className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Add
        </button>
      </div>
    </div>
  )
}
