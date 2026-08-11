import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Obituary } from '../../shared/obituary'
import { getObituaryBySlug, updateObituary, uploadImage } from '../lib/api'
import { hasRealScreenshot } from '../lib/screenshot'
import { DeathForm } from './DeathForm'
import { DurationBadge } from './DurationBadge'
import { EditableGoals } from './EditableGoals'
import { EditableMoments } from './EditableMoments'
import { ImageGallery } from './ImageGallery'
import { PointsOfInterestPicker } from './PointsOfInterestPicker'
import { RoutinesList } from './RoutinesList'
import { SkillsPicker } from './SkillsPicker'
import { TombstonePlaceholder } from './TombstonePlaceholder'
import { TraitPicker } from './TraitPicker'

const TABS = ['overview', 'journal', 'goals', 'activities'] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Overview',
  journal: 'Journal',
  goals: 'Goals',
  activities: 'Activities',
}

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
        className="w-20 rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-sm text-slate-200"
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
      className="rounded border border-dashed border-slate-700 px-2 py-0.5 text-sm text-slate-400 hover:border-slate-500 hover:text-slate-200"
      title="Click to set the current in-game day"
    >
      {currentDay !== null ? `Day ${currentDay}` : 'Set day...'}
    </button>
  )
}

export function ObituaryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [obituary, setObituary] = useState<Obituary | null | undefined>(null)
  const [showDeathForm, setShowDeathForm] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!slug) return
    getObituaryBySlug(slug).then(setObituary)
  }, [slug])

  if (obituary === null) {
    return <p className="p-8 text-center text-slate-400">Loading...</p>
  }
  if (!obituary || !slug) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Character not found.</p>
        <Link to="/" className="mt-2 inline-block text-emerald-400 hover:underline">
          Back to the list
        </Link>
      </div>
    )
  }

  async function persist(
    partial: Partial<
      Pick<Obituary, 'goals' | 'memorableMoments' | 'traits' | 'pointsOfInterest' | 'skills' | 'routines' | 'currentDay'>
    >,
  ) {
    const updated = await updateObituary(slug!, {
      goals: partial.goals ?? obituary!.goals,
      memorableMoments: partial.memorableMoments ?? obituary!.memorableMoments,
      traits: partial.traits ?? obituary!.traits,
      pointsOfInterest: partial.pointsOfInterest ?? obituary!.pointsOfInterest,
      skills: partial.skills ?? obituary!.skills,
      routines: partial.routines ?? obituary!.routines,
      currentDay: 'currentDay' in partial ? partial.currentDay! : obituary!.currentDay,
    })
    setObituary(updated)
  }

  async function handleUpload(file: File) {
    const updated = await uploadImage(slug!, file)
    setObituary(updated)
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
        ← Back
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{obituary.name}</h1>
          {(obituary.gameMode || obituary.startingLocation || obituary.occupation) && (
            <p className="mt-1 text-sm text-slate-400">
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
        {obituary.status === 'living' && (
          <button
            type="button"
            onClick={() => setShowDeathForm(true)}
            title="Record death"
            className="rounded-full border border-slate-700 p-2 text-xl hover:border-red-600"
          >
            💀
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        {obituary.status === 'living' && <p className="text-emerald-400">Still surviving...</p>}
        <CurrentDayControl currentDay={obituary.currentDay} onChange={(currentDay) => persist({ currentDay })} />
      </div>

      <div className="mt-4 flex gap-1 border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t
                ? 'border-b-2 border-emerald-500 text-slate-100'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'overview' && (
          <div className="space-y-6">
            {obituary.status === 'deceased' && (
              <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
                {hasRealScreenshot(obituary.restingPlaceScreenshot) ? (
                  <img
                    src={obituary.restingPlaceScreenshot}
                    alt="Final resting place"
                    className="w-full rounded object-cover"
                  />
                ) : (
                  <TombstonePlaceholder name={obituary.name} className="w-full rounded" />
                )}
                <p className="text-slate-300">{obituary.causeOfDeath}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
                  <span>
                    Survived <DurationBadge duration={obituary.runLength} />
                  </span>
                  <span>Favourite weapon: {obituary.favouriteWeapon}</span>
                  <span>Weight: {obituary.weight} kg</span>
                </div>
              </div>
            )}
            <ImageGallery images={obituary.images} onUpload={handleUpload} />
            <TraitPicker traits={obituary.traits} onChange={(traits) => persist({ traits })} />
          </div>
        )}

        {tab === 'journal' && (
          <div className="space-y-6">
            <PointsOfInterestPicker
              startingLocation={obituary.startingLocation}
              pointsOfInterest={obituary.pointsOfInterest}
              currentDay={obituary.currentDay}
              onChange={(pointsOfInterest) => persist({ pointsOfInterest })}
            />
            <EditableMoments
              moments={obituary.memorableMoments}
              onChange={(memorableMoments) => persist({ memorableMoments })}
            />
          </div>
        )}

        {tab === 'goals' && <EditableGoals goals={obituary.goals} onChange={(goals) => persist({ goals })} />}

        {tab === 'activities' && (
          <div className="space-y-6">
            <SkillsPicker skills={obituary.skills} onChange={(skills) => persist({ skills })} />
            <RoutinesList
              routines={obituary.routines}
              currentDay={obituary.currentDay}
              onChange={(routines) => persist({ routines })}
            />
          </div>
        )}
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
