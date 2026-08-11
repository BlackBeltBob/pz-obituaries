import { useEffect, useState } from 'react'
import type { JournalEntry, PointOfInterestEntry } from '../../shared/obituary'
import { getPoisCatalog } from '../lib/api'
import { EditableGoals } from './EditableGoals'

interface PointsOfInterestPickerProps {
  startingLocation: string
  pointsOfInterest: PointOfInterestEntry[]
  currentDay: number | null
  onChange: (pointsOfInterest: PointOfInterestEntry[]) => void
}

function JournalLog({
  entries,
  currentDay,
  onAdd,
  onRemove,
}: {
  entries: JournalEntry[]
  currentDay: number | null
  onAdd: (text: string) => void
  onRemove: (id: string) => void
}) {
  const [text, setText] = useState('')

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <div>
      <label className="text-sm text-slate-400">Notes</label>
      {entries.length > 0 && (
        <ul className="mt-1 space-y-1">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="mt-0.5 shrink-0 text-xs text-slate-500">
                {entry.day !== null ? `Day ${entry.day}` : new Date(entry.createdAt).toLocaleDateString()}
              </span>
              <span className="flex-1">{entry.text}</span>
              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                className="text-xs text-slate-500 hover:text-red-400"
                aria-label="Remove note"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={currentDay !== null ? `Add a note for day ${currentDay}...` : 'Add a note...'}
          className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-600"
        >
          Add
        </button>
      </div>
    </div>
  )
}

export function PointsOfInterestPicker({
  startingLocation,
  pointsOfInterest,
  currentDay,
  onChange,
}: PointsOfInterestPickerProps) {
  const [catalog, setCatalog] = useState<Record<string, string[]> | null>(null)
  const [newLocation, setNewLocation] = useState('')

  useEffect(() => {
    getPoisCatalog().then(setCatalog)
  }, [])

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading points of interest...</p>
  }

  const poiNames = catalog[startingLocation] ?? []
  const customNames = pointsOfInterest.map((p) => p.name).filter((name) => !poiNames.includes(name))
  const allNames = [...poiNames, ...customNames]
  const entryByName = new Map(pointsOfInterest.map((p) => [p.name, p]))
  const filledCount = pointsOfInterest.filter(
    (p) => p.visited || p.cleared || p.looted || p.notes.length > 0 || p.goals.length > 0,
  ).length

  function updateEntry(
    name: string,
    partial: Partial<Pick<PointOfInterestEntry, 'goals' | 'notes' | 'visited' | 'cleared' | 'looted'>>,
  ) {
    const existing = entryByName.get(name)
    onChange(
      existing
        ? pointsOfInterest.map((p) => (p.name === name ? { ...p, ...partial } : p))
        : [
            ...pointsOfInterest,
            { name, goals: [], notes: [], visited: false, cleared: false, looted: false, ...partial },
          ],
    )
  }

  function addNote(name: string, text: string) {
    const notes = entryByName.get(name)?.notes ?? []
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      text,
      day: currentDay,
      createdAt: new Date().toISOString(),
    }
    updateEntry(name, { notes: [...notes, entry] })
  }

  function removeNote(name: string, id: string) {
    const notes = entryByName.get(name)?.notes ?? []
    updateEntry(name, { notes: notes.filter((n) => n.id !== id) })
  }

  function addCustomLocation() {
    const name = newLocation.trim()
    if (!name || entryByName.has(name)) return
    onChange([...pointsOfInterest, { name, goals: [], notes: [], visited: false, cleared: false, looted: false }])
    setNewLocation('')
  }

  function removeCustomLocation(name: string) {
    onChange(pointsOfInterest.filter((p) => p.name !== name))
  }

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-lg font-semibold text-slate-100">
        <span className="inline-block text-slate-500 transition-transform group-open:rotate-90">›</span>
        Points of Interest
        {poiNames.length > 0 && (
          <span className="text-sm font-normal text-slate-500">
            ({filledCount}/{poiNames.length})
          </span>
        )}
      </summary>

      <div className="mt-2 space-y-2">
        {allNames.length === 0 && (
          <p className="text-sm text-slate-500">
            No known points of interest for {startingLocation || 'this location'}.
          </p>
        )}
        {allNames.map((name) => {
          const entry = entryByName.get(name)
          const isCustom = customNames.includes(name)
          return (
            <details key={name} className="group/poi rounded border border-slate-800">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-slate-200">
                <span className="inline-block text-slate-500 transition-transform group-open/poi:rotate-90">›</span>
                {name}
                {isCustom && <span className="text-xs text-slate-500">(custom)</span>}
              </summary>
              <div className="space-y-3 border-t border-slate-800 bg-slate-950/40 px-3 py-3">
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={entry?.visited ?? false}
                      onChange={(e) => updateEntry(name, { visited: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-emerald-600"
                    />
                    Visited
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={entry?.cleared ?? false}
                      onChange={(e) => updateEntry(name, { cleared: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-emerald-600"
                    />
                    Cleared
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={entry?.looted ?? false}
                      onChange={(e) => updateEntry(name, { looted: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-emerald-600"
                    />
                    Looted
                  </label>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => removeCustomLocation(name)}
                      className="ml-auto text-xs text-slate-500 hover:text-red-400"
                    >
                      Remove location
                    </button>
                  )}
                </div>
                <JournalLog
                  entries={entry?.notes ?? []}
                  currentDay={currentDay}
                  onAdd={(text) => addNote(name, text)}
                  onRemove={(id) => removeNote(name, id)}
                />
                <EditableGoals goals={entry?.goals ?? []} onChange={(goals) => updateEntry(name, { goals })} />
              </div>
            </details>
          )
        })}

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomLocation()}
            placeholder="Add a location not on the list..."
            className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200"
          />
          <button
            type="button"
            onClick={addCustomLocation}
            className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-600"
          >
            Add
          </button>
        </div>
      </div>
    </details>
  )
}
