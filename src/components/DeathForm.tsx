import { useState, type FormEvent } from 'react'
import type { Obituary, RunDuration } from '../../shared/obituary'
import { submitDeath, uploadImage } from '../lib/api'

interface DeathFormProps {
  slug: string
  onClose: () => void
  onSubmitted: (obituary: Obituary) => void
}

const emptyDuration: RunDuration = { years: 0, months: 0, days: 0, hours: 0, minutes: 0 }

export function DeathForm({ slug, onClose, onSubmitted }: DeathFormProps) {
  const [causeOfDeath, setCauseOfDeath] = useState('')
  const [weight, setWeight] = useState('')
  const [favouriteWeapon, setFavouriteWeapon] = useState('')
  const [runLength, setRunLength] = useState<RunDuration>(emptyDuration)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateDuration(field: keyof RunDuration, value: string) {
    setRunLength((prev) => ({ ...prev, [field]: Number(value) || 0 }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      let restingPlaceScreenshot = ''
      if (screenshot) {
        const withImage = await uploadImage(slug, screenshot)
        restingPlaceScreenshot = withImage.images[withImage.images.length - 1]
      }
      const updated = await submitDeath(slug, {
        causeOfDeath,
        weight: Number(weight) || 0,
        favouriteWeapon,
        runLength,
        restingPlaceScreenshot,
      })
      onSubmitted(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record death')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Record Death</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Cause of death</label>
            <textarea
              required
              value={causeOfDeath}
              onChange={(e) => setCauseOfDeath(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              rows={2}
            />
          </div>

          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Run length</span>
            <div className="mt-1 grid grid-cols-5 gap-1">
              {(Object.keys(emptyDuration) as Array<keyof RunDuration>).map((field) => (
                <div key={field}>
                  <input
                    type="number"
                    min={0}
                    value={runLength[field]}
                    onChange={(e) => updateDuration(field, e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <div className="mt-0.5 text-center text-[10px] text-slate-500">{field}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Favourite weapon</label>
            <input
              required
              type="text"
              value={favouriteWeapon}
              onChange={(e) => setFavouriteWeapon(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Weight (kg)</label>
            <input
              required
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-sm text-slate-500 dark:text-slate-400">Resting place screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-slate-600 dark:text-slate-300"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
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
              className="rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Confirm Death'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
