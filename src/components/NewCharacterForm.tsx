import { useState, type FormEvent } from 'react'
import { GAME_MODES, STARTING_LOCATIONS, type Obituary } from '../../shared/obituary'
import { createObituary } from '../lib/api'

interface NewCharacterFormProps {
  onClose: () => void
  onCreated: (obituary: Obituary) => void
}

export function NewCharacterForm({ onClose, onCreated }: NewCharacterFormProps) {
  const [name, setName] = useState('')
  const [gameMode, setGameMode] = useState<string>(GAME_MODES[0])
  const [startingLocation, setStartingLocation] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        goals: [],
        memorableMoments: [],
        traits: [],
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
      <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-slate-100">New Character</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Character name"
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
          />

          <div>
            <label className="text-sm text-slate-400">Game mode</label>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
            >
              {GAME_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400">Starting location *</label>
            <select
              required
              value={startingLocation}
              onChange={(e) => setStartingLocation(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
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

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
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
