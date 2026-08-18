import { useEffect, useState } from 'react'
import {
  POI_CATEGORIES,
  POI_STATUSES,
  type JournalEntry,
  type PoiCatalogEntry,
  type PoiStatus,
  type PointOfInterestEntry,
} from '../../shared/obituary'
import { getPoisCatalog } from '../lib/api'
import { EditableGoals } from './EditableGoals'

const CATEGORY_RANK = new Map(POI_CATEGORIES.map((category, index) => [category, index]))

const CATEGORY_LABELS: Record<(typeof POI_CATEGORIES)[number], string> = {
  medical: 'Medical',
  foods: 'Foods',
  furniture: 'Furniture',
  warehouse: 'Warehouse',
  utilities: 'Utilities',
  mechanics: 'Mechanics',
  firearms: 'Firearms',
  other: 'Other',
}

const STATUS_LABELS: Record<PoiStatus, string> = {
  unvisited: 'Unvisited',
  overrun: 'Overrun',
  cleared: 'Cleared',
  looted: 'Looted',
}

const STATUS_COLORS: Record<PoiStatus, { active: string; badge: string }> = {
  unvisited: {
    active: 'bg-emerald-600 text-white',
    badge: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  },
  overrun: {
    active: 'bg-red-600 text-white',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  },
  cleared: {
    active: 'bg-yellow-500 text-slate-900',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  },
  looted: {
    active: 'bg-green-600 text-white',
    badge: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  },
}

function sortEntries(
  entries: PoiCatalogEntry[],
  entryByName: Map<string, PointOfInterestEntry>,
): PoiCatalogEntry[] {
  return [...entries].sort((a, b) => {
    const pinnedA = entryByName.get(a.name)?.pinned ?? false
    const pinnedB = entryByName.get(b.name)?.pinned ?? false
    if (pinnedA !== pinnedB) return pinnedA ? -1 : 1
    const rankDiff = CATEGORY_RANK.get(a.category)! - CATEGORY_RANK.get(b.category)!
    return rankDiff !== 0 ? rankDiff : a.name.localeCompare(b.name)
  })
}

export function StatusToggle({ status, onChange }: { status: PoiStatus; onChange: (status: PoiStatus) => void }) {
  return (
    <div
      role="group"
      aria-label="Status"
      className="flex divide-x divide-slate-300 overflow-hidden rounded border border-slate-300 dark:divide-slate-700 dark:border-slate-700"
    >
      {POI_STATUSES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={status === option}
          onClick={() => onChange(option)}
          className={`px-2 py-1 text-xs transition ${
            status === option
              ? STATUS_COLORS[option].active
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {STATUS_LABELS[option]}
        </button>
      ))}
    </div>
  )
}

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
      <label className="text-sm text-slate-500 dark:text-slate-400">Notes</label>
      {entries.length > 0 && (
        <ul className="mt-1 space-y-1">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="mt-0.5 shrink-0 text-xs text-slate-500">
                {entry.day !== null ? `Day ${entry.day}` : new Date(entry.createdAt).toLocaleDateString()}
              </span>
              <span className="flex-1">{entry.text}</span>
              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
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
          className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
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
  const [catalog, setCatalog] = useState<Record<string, PoiCatalogEntry[]> | null>(null)
  const [newLocation, setNewLocation] = useState('')

  useEffect(() => {
    getPoisCatalog().then(setCatalog)
  }, [])

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading points of interest...</p>
  }

  const catalogEntries = catalog[startingLocation] ?? []
  const poiNames = catalogEntries.map((p) => p.name)
  const customEntries: PoiCatalogEntry[] = pointsOfInterest
    .map((p) => p.name)
    .filter((name) => !poiNames.includes(name))
    .map((name) => ({ name, category: 'other' }))
  const entryByName = new Map(pointsOfInterest.map((p) => [p.name, p]))
  const allEntries = sortEntries([...catalogEntries, ...customEntries], entryByName)
  const filledCount = pointsOfInterest.filter(
    (p) => p.status !== 'unvisited' || p.notes.length > 0 || p.goals.length > 0,
  ).length

  function updateEntry(
    name: string,
    partial: Partial<Pick<PointOfInterestEntry, 'goals' | 'notes' | 'status' | 'pinned'>>,
  ) {
    const existing = entryByName.get(name)
    onChange(
      existing
        ? pointsOfInterest.map((p) => (p.name === name ? { ...p, ...partial } : p))
        : [...pointsOfInterest, { name, goals: [], notes: [], status: 'unvisited', pinned: false, ...partial }],
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
    onChange([...pointsOfInterest, { name, goals: [], notes: [], status: 'unvisited', pinned: false }])
    setNewLocation('')
  }

  function removeCustomLocation(name: string) {
    onChange(pointsOfInterest.filter((p) => p.name !== name))
  }

  return (
    <details open className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        <span className="inline-block text-slate-500 transition-transform group-open:rotate-90">›</span>
        Points of Interest
        {poiNames.length > 0 && (
          <span className="text-sm font-normal text-slate-500">
            ({filledCount}/{poiNames.length})
          </span>
        )}
      </summary>

      <div className="mt-2 space-y-2">
        {allEntries.length === 0 && (
          <p className="text-sm text-slate-500">
            No known points of interest for {startingLocation || 'this location'}.
          </p>
        )}
        {allEntries.map(({ name, category }) => {
          const entry = entryByName.get(name)
          const isCustom = !poiNames.includes(name)
          return (
            <details key={name} className="group/poi rounded border border-slate-200 dark:border-slate-800">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-slate-800 dark:text-slate-200">
                <span className="inline-block text-slate-500 transition-transform group-open/poi:rotate-90">›</span>
                {name}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {CATEGORY_LABELS[category]}
                </span>
                {isCustom && <span className="text-xs text-slate-500">(custom)</span>}
                <span className={`ml-auto rounded px-1.5 py-0.5 text-xs ${STATUS_COLORS[entry?.status ?? 'unvisited'].badge}`}>
                  {STATUS_LABELS[entry?.status ?? 'unvisited']}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    updateEntry(name, { pinned: !(entry?.pinned ?? false) })
                  }}
                  aria-pressed={entry?.pinned ?? false}
                  aria-label={entry?.pinned ? 'Unpin' : 'Pin to top'}
                  className={`shrink-0 leading-none transition-opacity ${
                    entry?.pinned ? 'opacity-100' : 'opacity-50 hover:opacity-90'
                  }`}
                >
                  📌
                </button>
              </summary>
              <div className="space-y-3 border-t border-slate-200 bg-slate-50/60 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <StatusToggle
                    status={entry?.status ?? 'unvisited'}
                    onChange={(status) => updateEntry(name, { status })}
                  />
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => removeCustomLocation(name)}
                      className="ml-auto text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
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
            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={addCustomLocation}
            className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Add
          </button>
        </div>
      </div>
    </details>
  )
}
