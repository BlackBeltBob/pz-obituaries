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
import { TombstonePlaceholder } from './TombstonePlaceholder'
import { TraitPicker } from './TraitPicker'

export function ObituaryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [obituary, setObituary] = useState<Obituary | null | undefined>(null)
  const [showDeathForm, setShowDeathForm] = useState(false)

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
    partial: Partial<Pick<Obituary, 'goals' | 'memorableMoments' | 'traits' | 'pointsOfInterest'>>,
  ) {
    const updated = await updateObituary(slug!, {
      goals: partial.goals ?? obituary!.goals,
      memorableMoments: partial.memorableMoments ?? obituary!.memorableMoments,
      traits: partial.traits ?? obituary!.traits,
      pointsOfInterest: partial.pointsOfInterest ?? obituary!.pointsOfInterest,
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
          {(obituary.gameMode || obituary.startingLocation) && (
            <p className="mt-1 text-sm text-slate-400">
              {[obituary.gameMode, obituary.startingLocation && `Started in ${obituary.startingLocation}`]
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

      {obituary.status === 'deceased' && (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
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
      {obituary.status === 'living' && <p className="mt-2 text-emerald-400">Still surviving...</p>}

      <div className="mt-6">
        <ImageGallery images={obituary.images} onUpload={handleUpload} />
      </div>

      <div className="mt-6">
        <TraitPicker traits={obituary.traits} onChange={(traits) => persist({ traits })} />
      </div>

      <div className="mt-6">
        <PointsOfInterestPicker
          startingLocation={obituary.startingLocation}
          pointsOfInterest={obituary.pointsOfInterest}
          onChange={(pointsOfInterest) => persist({ pointsOfInterest })}
        />
      </div>

      <div className="mt-6">
        <EditableGoals goals={obituary.goals} onChange={(goals) => persist({ goals })} />
      </div>

      <div className="mt-6">
        <EditableMoments
          moments={obituary.memorableMoments}
          onChange={(memorableMoments) => persist({ memorableMoments })}
        />
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
