import { useEffect, useState, type FormEvent } from 'react'
import { GAME_MODES, STARTING_LOCATIONS, type Obituary } from '../../shared/obituary'
import { createObituary, getOccupationsCatalog } from '../lib/api'
import { TraitPicker } from './TraitPicker'

interface NewCharacterFormProps {
  onClose: () => void
  onCreated: (obituary: Obituary) => void
}

export function NewCharacterForm({ onClose, onCreated }: NewCharacterFormProps) {
  const [name, setName] = useState('')
  const [gameMode, setGameMode] = useState<string>(GAME_MODES[0])
  const [startingLocation, setStartingLocation] = useState<string>('')
  const [occupations, setOccupations] = useState<string[] | null>(null)
  const [occupation, setOccupation] = useState<string>('')
  const [traits, setTraits] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOccupationsCatalog().then((catalog) => {
      setOccupations(catalog)
      setOccupation(catalog[0] ?? '')
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (!startingLocation) {
      setError('Pick a starting location.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const obituary = await createObituary({
        name: name.trim(),
        gameMode,
        startingLocation,
        occupation,
        goals: [],
        memorableMoments: [],
        traits,
      })
      onCreated(obituary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New Character</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Character name"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Game mode</label>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {GAME_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Starting location *</label>
            <select
              required
              value={startingLocation}
              onChange={(e) => setStartingLocation(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="" disabled>
                Select a location...
              </option>
              {STARTING_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Occupation</label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              disabled={!occupations}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {(occupations ?? []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700">
            <TraitPicker traits={traits} onChange={setTraits} />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
