import type { Obituary } from '../../shared/obituary'
import type { PersistFn } from './ObituaryDetail'
import { BasesPicker } from './BasesPicker'
import { EditableGoals } from './EditableGoals'
import { EditableMoments } from './EditableMoments'
import { ImageGallery } from './ImageGallery'
import { KeyItemsTracker } from './KeyItemsTracker'
import { PointsOfInterestPicker } from './PointsOfInterestPicker'
import { RoutinesList } from './RoutinesList'
import { SkillbooksPicker } from './SkillbooksPicker'
import { SkillsPicker } from './SkillsPicker'
import { PlainCard, SummaryCard } from './SummaryCard'
import { TraitPicker } from './TraitPicker'

export interface DashboardViewProps {
  obituary: Obituary
  persist: PersistFn
  handleUpload: (file: File) => Promise<void>
}

// Desktop (lg+): full flex-wrap layout. Cards stay permanently expanded at
// this width (see SummaryCard/PointsOfInterestPicker's useIsDesktop check)
// -- collapse remains available below lg, where space is tighter. Traits
// stays compact at every width (see TraitPicker) since it only ever shows
// the selected traits, with the full catalog moved into its own modal, so
// it no longer needs the full-width/reordered treatment a huge inline
// catalog used to require.
//
// Tablet (md, <lg): Key Items breaks out into its own side column via the
// md:flex/lg:contents wrapper below; Memorable Moments and Photos are last
// in DOM order, which naturally lands them toward the bottom as the wrap
// flows, without needing explicit `order-*` overrides.
//
// Cards use flex-basis (not equal grid columns) so width tracks each
// category's actual content -- Goals/Bases/Routines/POI each hold a row of
// several inline text inputs (+ buttons) that overflow a narrow card, so
// they get more base width than e.g. Skills' compact +/- rows need.
// `shrink-0` keeps a card from being squeezed below its basis (which would
// reintroduce the overflow bug); `flex-1` lets it grow to fill leftover
// space in its row instead.
export function DashboardView({ obituary, persist, handleUpload }: DashboardViewProps) {
  const achievedGoals = obituary.goals.filter((g) => g.achieved).length
  const doneRoutines = obituary.routines.filter((r) => r.done).length

  return (
    <div className="mt-6 md:flex md:items-start md:gap-4 lg:block">
      <div className="flex flex-1 flex-wrap items-start gap-3 lg:gap-4">
        <PlainCard className="flex-1 shrink-0 basis-72">
          <TraitPicker traits={obituary.traits} onChange={(traits) => persist({ traits })} />
        </PlainCard>

        <PlainCard className="flex-1 shrink-0 basis-96">
          <PointsOfInterestPicker
            startingLocation={obituary.startingLocation}
            pointsOfInterest={obituary.pointsOfInterest}
            currentDay={obituary.currentDay}
            onChange={(pointsOfInterest) => persist({ pointsOfInterest })}
          />
        </PlainCard>

        <SummaryCard title="Goals" count={`${achievedGoals}/${obituary.goals.length}`} className="flex-1 shrink-0 basis-96">
          <EditableGoals goals={obituary.goals} onChange={(goals) => persist({ goals })} />
        </SummaryCard>

        <SummaryCard title="Skills & Skill Books" className="flex-1 shrink-0 basis-[480px]">
          <div className="space-y-4">
            <SkillsPicker skills={obituary.skills} onChange={(skills) => persist({ skills })} />
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <SkillbooksPicker skillbooks={obituary.skillbooks} onChange={(skillbooks) => persist({ skillbooks })} />
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Bases" count={`${obituary.bases.length}`} className="flex-1 shrink-0 basis-[460px]">
          <BasesPicker
            bases={obituary.bases}
            selectedBaseId={obituary.selectedBaseId}
            onChange={(update) => persist(update)}
          />
        </SummaryCard>

        <SummaryCard title="Routines" count={`${doneRoutines}/${obituary.routines.length}`} className="flex-1 shrink-0 basis-96">
          <RoutinesList
            routines={obituary.routines}
            currentDay={obituary.currentDay}
            onChange={(routines) => persist({ routines })}
          />
        </SummaryCard>

        {/* Key Items also renders here for desktop -- hidden at tablet, where it's a side column instead */}
        <div className="hidden flex-1 shrink-0 basis-64 lg:block">
          <SummaryCard title="Key Items" count={`${obituary.items.length}`}>
            <KeyItemsTracker items={obituary.items} onChange={(items) => persist({ items })} />
          </SummaryCard>
        </div>

        {/* Less-frequently-needed at a glance -- last in DOM order so they land toward the bottom of the wrap */}
        <SummaryCard
          title="Memorable Moments"
          count={`${obituary.memorableMoments.length}`}
          className="flex-1 shrink-0 basis-96"
        >
          <EditableMoments
            moments={obituary.memorableMoments}
            onChange={(memorableMoments) => persist({ memorableMoments })}
          />
        </SummaryCard>
        <SummaryCard title="Photos" count={`${obituary.images.length}`} className="flex-1 shrink-0 basis-96">
          <ImageGallery images={obituary.images} onUpload={handleUpload} />
        </SummaryCard>
      </div>

      {/* Tablet-only side column for Key Items */}
      <div className="mt-3 md:mt-0 md:w-40 md:shrink-0 lg:hidden">
        <SummaryCard title="Key Items" count={`${obituary.items.length}`}>
          <KeyItemsTracker items={obituary.items} onChange={(items) => persist({ items })} />
        </SummaryCard>
      </div>
    </div>
  )
}
