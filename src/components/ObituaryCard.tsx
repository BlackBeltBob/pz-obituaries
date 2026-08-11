import { Link } from 'react-router-dom'
import type { Obituary } from '../../shared/obituary'
import { hasRealScreenshot } from '../lib/screenshot'
import { DurationBadge } from './DurationBadge'
import { TombstonePlaceholder } from './TombstonePlaceholder'

interface ObituaryCardProps {
  obituary: Obituary
}

export function ObituaryCard({ obituary }: ObituaryCardProps) {
  const thumbnail = obituary.status === 'deceased' ? obituary.restingPlaceScreenshot : obituary.images[0]
  const achievedGoals = obituary.goals.filter((g) => g.achieved).length
  const loggedPois = obituary.pointsOfInterest.filter((p) => p.visited || p.notes.length > 0).length

  return (
    <Link
      to={`/${obituary.slug}`}
      className="block overflow-hidden rounded-lg border border-slate-800 bg-slate-900 transition hover:border-slate-600"
    >
      <div className="aspect-video bg-slate-800">
        {obituary.status === 'deceased' && !hasRealScreenshot(thumbnail ?? '') ? (
          <TombstonePlaceholder name={obituary.name} className="h-full w-full" />
        ) : (
          thumbnail && <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-slate-100">{obituary.name}</h3>
        {(obituary.gameMode || obituary.startingLocation) && (
          <p className="text-xs text-slate-500">
            {[obituary.gameMode, obituary.startingLocation].filter(Boolean).join(' · ')}
          </p>
        )}
        {obituary.status === 'deceased' ? (
          <>
            <p className="mt-1 truncate text-sm text-slate-400">{obituary.causeOfDeath}</p>
            <div className="mt-2">
              <DurationBadge duration={obituary.runLength} compact />
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-emerald-400">Still surviving...</p>
        )}
        {(obituary.goals.length > 0 || loggedPois > 0) && (
          <p className="mt-2 flex gap-3 text-xs text-slate-500">
            {obituary.goals.length > 0 && (
              <span>
                ✓ {achievedGoals}/{obituary.goals.length} goals
              </span>
            )}
            {loggedPois > 0 && <span>📍 {loggedPois} POIs logged</span>}
          </p>
        )}
      </div>
    </Link>
  )
}
