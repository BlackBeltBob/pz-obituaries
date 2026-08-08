import { useEffect, useState } from 'react'
import type { PointOfInterestEntry } from '../../shared/obituary'
import { getPoisCatalog } from '../lib/api'
import { EditableGoals } from './EditableGoals'

interface PointsOfInterestPickerProps {
  startingLocation: string
  pointsOfInterest: PointOfInterestEntry[]
  onChange: (pointsOfInterest: PointOfInterestEntry[]) => void
}

export function PointsOfInterestPicker({
  startingLocation,
  pointsOfInterest,
  onChange,
}: PointsOfInterestPickerProps) {
  const [catalog, setCatalog] = useState<Record<string, string[]> | null>(null)

  useEffect(() => {
    getPoisCatalog().then(setCatalog)
  }, [])

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading points of interest...</p>
  }

  const poiNames = catalog[startingLocation] ?? []
  const entryByName = new Map(pointsOfInterest.map((p) => [p.name, p]))
  const filledCount = pointsOfInterest.filter(
    (p) => p.visited || p.cleared || p.looted || p.notes.trim() || p.goals.length > 0,
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
            { name, goals: [], notes: '', visited: false, cleared: false, looted: false, ...partial },
          ],
    )
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
        {poiNames.length === 0 && (
          <p className="text-sm text-slate-500">
            No known points of interest for {startingLocation || 'this location'}.
          </p>
        )}
        {poiNames.map((name) => {
          const entry = entryByName.get(name)
          return (
            <details key={name} className="group/poi rounded border border-slate-800">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-slate-200">
                <span className="inline-block text-slate-500 transition-transform group-open/poi:rotate-90">›</span>
                {name}
              </summary>
              <div className="space-y-3 border-t border-slate-800 bg-slate-950/40 px-3 py-3">
                <div className="flex gap-4 text-sm text-slate-300">
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
                </div>
                <div>
                  <label className="text-sm text-slate-400">Notes</label>
                  <textarea
                    value={entry?.notes ?? ''}
                    onChange={(e) => updateEntry(name, { notes: e.target.value })}
                    rows={2}
                    placeholder="Notes about this location..."
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200"
                  />
                </div>
                <EditableGoals goals={entry?.goals ?? []} onChange={(goals) => updateEntry(name, { goals })} />
              </div>
            </details>
          )
        })}
      </div>
    </details>
  )
}
