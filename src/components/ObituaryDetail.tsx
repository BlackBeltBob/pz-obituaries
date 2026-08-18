import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Obituary } from '../../shared/obituary'
import { deleteObituary, getObituaryBySlug, updateObituary, uploadImage } from '../lib/api'
import { hasRealScreenshot } from '../lib/screenshot'
import { DashboardView } from './DashboardView'
import { DeathForm } from './DeathForm'
import { DurationBadge } from './DurationBadge'
import { MobileQuickView } from './MobileQuickView'
import { TombstonePlaceholder } from './TombstonePlaceholder'

export type PersistFn = (
  partial: Partial<
    Pick<
      Obituary,
      | 'goals'
      | 'memorableMoments'
      | 'traits'
      | 'pointsOfInterest'
      | 'skills'
      | 'skillbooks'
      | 'routines'
      | 'currentDay'
      | 'bases'
      | 'selectedBaseId'
      | 'items'
    >
  >,
) => void

function CurrentDayControl({
  currentDay,
  onChange,
}: {
  currentDay: number | null
  onChange: (day: number | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentDay?.toString() ?? '')

  function commit() {
    const trimmed = value.trim()
    onChange(trimmed === '' ? null : Math.max(0, Number(trimmed) || 0))
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="w-20 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setValue(currentDay?.toString() ?? '')
        setEditing(true)
      }}
      className="rounded border border-dashed border-slate-400 px-2 py-0.5 text-sm text-slate-500 hover:border-slate-600 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200"
      title="Click to set the current in-game day"
    >
      {currentDay !== null ? `Day ${currentDay}` : 'Set day...'}
    </button>
  )
}

export function ObituaryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [obituary, setObituary] = useState<Obituary | null | undefined>(null)
  const [showDeathForm, setShowDeathForm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!slug) return
    getObituaryBySlug(slug).then(setObituary)
  }, [slug])

  if (obituary === null) {
    return <p className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</p>
  }
  if (!obituary || !slug) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">Character not found.</p>
        <Link to="/" className="mt-2 inline-block text-emerald-600 hover:underline dark:text-emerald-400">
          Back to the list
        </Link>
      </div>
    )
  }

  const persist: PersistFn = async (partial) => {
    const updated = await updateObituary(slug!, {
      goals: partial.goals ?? obituary!.goals,
      memorableMoments: partial.memorableMoments ?? obituary!.memorableMoments,
      traits: partial.traits ?? obituary!.traits,
      pointsOfInterest: partial.pointsOfInterest ?? obituary!.pointsOfInterest,
      skills: partial.skills ?? obituary!.skills,
      skillbooks: partial.skillbooks ?? obituary!.skillbooks,
      routines: partial.routines ?? obituary!.routines,
      currentDay: 'currentDay' in partial ? partial.currentDay! : obituary!.currentDay,
      bases: partial.bases ?? obituary!.bases,
      selectedBaseId: 'selectedBaseId' in partial ? partial.selectedBaseId! : obituary!.selectedBaseId,
      items: partial.items ?? obituary!.items,
    })
    setObituary(updated)
  }

  async function handleUpload(file: File) {
    const updated = await uploadImage(slug!, file)
    setObituary(updated)
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete ${obituary!.name}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteObituary(slug!)
      navigate('/')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete character')
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:max-w-none lg:px-8">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        ← Back
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{obituary.name}</h1>
          {(obituary.gameMode || obituary.startingLocation || obituary.occupation) && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {[
                obituary.gameMode,
                obituary.startingLocation && `Started in ${obituary.startingLocation}`,
                obituary.occupation,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {obituary.status === 'living' && (
            <button
              type="button"
              onClick={() => setShowDeathForm(true)}
              title="Record death"
              className="rounded-full border border-slate-300 p-2 text-xl hover:border-red-600 dark:border-slate-700"
            >
              💀
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete character"
            className="rounded-full border border-slate-300 p-2 text-xl hover:border-red-600 disabled:opacity-50 dark:border-slate-700"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        {obituary.status === 'living' && <p className="text-emerald-600 dark:text-emerald-400">Still surviving...</p>}
        <CurrentDayControl currentDay={obituary.currentDay} onChange={(currentDay) => persist({ currentDay })} />
      </div>

      {obituary.status === 'deceased' && (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {hasRealScreenshot(obituary.restingPlaceScreenshot) ? (
            <img
              src={obituary.restingPlaceScreenshot}
              alt="Final resting place"
              className="w-full max-w-md rounded object-cover"
            />
          ) : (
            <TombstonePlaceholder name={obituary.name} className="w-full max-w-md rounded" />
          )}
          <p className="text-slate-700 dark:text-slate-300">{obituary.causeOfDeath}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span>
              Survived <DurationBadge duration={obituary.runLength} />
            </span>
            <span>Favourite weapon: {obituary.favouriteWeapon}</span>
            <span>Weight: {obituary.weight} kg</span>
          </div>
        </div>
      )}

      {/* Mobile (<768px): rapid-input view, not a shrunk dashboard */}
      <div className="md:hidden">
        <MobileQuickView obituary={obituary} persist={persist} />
      </div>

      {/* Tablet (md) + desktop (lg+): aggregate-summary dashboard */}
      <div className="hidden md:block">
        <DashboardView obituary={obituary} persist={persist} handleUpload={handleUpload} />
      </div>

      {showDeathForm && (
        <DeathForm
          slug={slug}
          onClose={() => setShowDeathForm(false)}
          onSubmitted={(updated) => {
            setObituary(updated)
            setShowDeathForm(false)
          }}
        />
      )}
    </div>
  )
}
