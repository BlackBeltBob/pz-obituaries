import { useEffect, useState, type ReactNode } from 'react'
import type { Obituary, PoiCatalogEntry, PointOfInterestEntry } from '../../shared/obituary'
import { getPoisCatalog } from '../lib/api'
import { EditableGoals } from './EditableGoals'
import type { PersistFn } from './ObituaryDetail'
import { StatusToggle } from './PointsOfInterestPicker'
import { SkillbooksPicker } from './SkillbooksPicker'
import { SkillsPicker } from './SkillsPicker'

export interface MobileQuickViewProps {
  obituary: Obituary
  persist: PersistFn
}

// Flat, no-drill-down POI status list -- mobile only cares about the
// Visited/Cleared/Looted state, not the per-POI goals/notes journal that
// the full PointsOfInterestPicker also handles.
function MobilePoiStatus({ obituary, persist }: MobileQuickViewProps) {
  const [catalog, setCatalog] = useState<Record<string, PoiCatalogEntry[]> | null>(null)

  useEffect(() => {
    getPoisCatalog().then(setCatalog)
  }, [])

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading points of interest...</p>
  }

  const catalogEntries = catalog[obituary.startingLocation] ?? []
  const entryByName = new Map(obituary.pointsOfInterest.map((p) => [p.name, p]))
  const names = [...new Set([...catalogEntries.map((p) => p.name), ...obituary.pointsOfInterest.map((p) => p.name)])]

  function setStatus(name: string, status: PointOfInterestEntry['status']) {
    const existing = entryByName.get(name)
    const pointsOfInterest = existing
      ? obituary.pointsOfInterest.map((p) => (p.name === name ? { ...p, status } : p))
      : [...obituary.pointsOfInterest, { name, goals: [], notes: [], status, pinned: false }]
    persist({ pointsOfInterest })
  }

  if (names.length === 0) {
    return (
      <p className="text-sm text-slate-500">No known points of interest for {obituary.startingLocation || 'this location'}.</p>
    )
  }

  return (
    <ul className="space-y-1.5">
      {names.map((name) => (
        <li
          key={name}
          className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1.5 dark:border-slate-800"
        >
          <span className="text-sm text-slate-800 dark:text-slate-200">{name}</span>
          <StatusToggle status={entryByName.get(name)?.status ?? 'unvisited'} onChange={(status) => setStatus(name, status)} />
        </li>
      ))}
    </ul>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}

// Not a shrunk dashboard -- a deliberately narrow rapid-input view for
// glancing at mid-session: flip POI status, mark skills/skillbooks, jot
// goal notes. POI comes first -- it's the most frequent quick check
// mid-session. Everything else (Traits, Bases, Routines, Photos, etc.)
// lives behind the tablet/desktop dashboard only.
export function MobileQuickView({ obituary, persist }: MobileQuickViewProps) {
  return (
    <div className="mt-6 space-y-3">
      <Section title="Points of Interest">
        <MobilePoiStatus obituary={obituary} persist={persist} />
      </Section>
      <Section title="Skills">
        <SkillsPicker skills={obituary.skills} onChange={(skills) => persist({ skills })} />
      </Section>
      <Section title="Skill Books">
        <SkillbooksPicker skillbooks={obituary.skillbooks} onChange={(skillbooks) => persist({ skillbooks })} />
      </Section>
      <Section title="Goals">
        <EditableGoals goals={obituary.goals} onChange={(goals) => persist({ goals })} />
      </Section>
    </div>
  )
}
