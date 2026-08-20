import { useEffect, useState } from 'react'
import type { TraitCategory, TraitDefinition } from '../../shared/obituary'
import { getTraitsCatalog } from '../lib/api'

interface TraitPickerProps {
  traits: string[]
  onChange: (traits: string[]) => void
  // 'compact' (default): dashboard use, where traits are mostly just
  // displayed -- shows only the selected traits, with catalog browsing
  // moved into a modal so this card stays a predictable size. 'inline':
  // character creation, where nothing is selected yet and picking traits
  // *is* the task, so the full catalog should be visible immediately.
  variant?: 'compact' | 'inline'
}

const categoryStyles: Record<TraitCategory, { selected: string; unselected: string }> = {
  positive: {
    selected: 'border-emerald-500 bg-emerald-600 text-white',
    unselected:
      'border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:border-emerald-600',
  },
  negative: {
    selected: 'border-red-500 bg-red-600 text-white',
    unselected:
      'border-red-300 bg-red-50 text-red-700 hover:border-red-500 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 dark:hover:border-red-600',
  },
}

function TraitPill({
  name,
  category,
  selected,
  onClick,
}: {
  name: string
  category: TraitCategory
  selected: boolean
  onClick: () => void
}) {
  const style = categoryStyles[category]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3 py-1 text-sm font-medium ${selected ? style.selected : style.unselected}`}
    >
      {category === 'positive' ? '+' : '−'} {name}
    </button>
  )
}

// Read-only version of TraitPill for the always-selected compact display --
// editing only happens in the modal below.
function TraitChip({ name, category }: { name: string; category: TraitCategory }) {
  const style = categoryStyles[category]
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${style.selected}`}>
      {category === 'positive' ? '+' : '−'} {name}
    </span>
  )
}

function TraitEditorModal({
  catalog,
  traits,
  legacyTraits,
  onToggle,
  onClose,
}: {
  catalog: TraitDefinition[]
  traits: string[]
  legacyTraits: string[]
  onToggle: (trait: string) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit Traits</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Done
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {catalog.map((trait) => (
            <TraitPill
              key={trait.name}
              name={trait.name}
              category={trait.category}
              selected={traits.includes(trait.name)}
              onClick={() => onToggle(trait.name)}
            />
          ))}
        </div>

        {legacyTraits.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500">No longer on the trait list, but kept on this character:</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {legacyTraits.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => onToggle(trait)}
                  title="Remove this trait"
                  className="rounded-full border border-dashed border-slate-400 px-3 py-1 text-sm text-slate-500 hover:border-red-500 hover:text-red-600 dark:border-slate-600 dark:text-slate-400 dark:hover:text-red-400"
                >
                  {trait} ✕
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// The full catalog rarely changes mid-run and is large enough that showing
// it inline made this card the tallest thing on the page. Instead, this
// stays a compact, fixed-size list of just the selected traits, and editing
// (browsing the full catalog) happens in a modal instead.
export function TraitPicker({ traits, onChange, variant = 'compact' }: TraitPickerProps) {
  const [catalog, setCatalog] = useState<TraitDefinition[] | null>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    getTraitsCatalog().then(setCatalog)
  }, [])

  function toggle(trait: string) {
    onChange(traits.includes(trait) ? traits.filter((t) => t !== trait) : [...traits, trait])
  }

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading traits...</p>
  }

  const catalogByName = new Map(catalog.map((t) => [t.name, t]))
  const selectedInCatalogOrder = catalog.filter((t) => traits.includes(t.name))
  const legacyTraits = traits.filter((t) => !catalogByName.has(t))

  if (variant === 'inline') {
    return (
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Traits
          {traits.length > 0 && <span className="text-sm font-normal text-slate-500">({traits.length})</span>}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {catalog.map((trait) => (
            <TraitPill
              key={trait.name}
              name={trait.name}
              category={trait.category}
              selected={traits.includes(trait.name)}
              onClick={() => toggle(trait.name)}
            />
          ))}
        </div>
        {legacyTraits.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500">No longer on the trait list, but kept on this character:</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {legacyTraits.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggle(trait)}
                  title="Remove this trait"
                  className="rounded-full border border-dashed border-slate-400 px-3 py-1 text-sm text-slate-500 hover:border-red-500 hover:text-red-600 dark:border-slate-600 dark:text-slate-400 dark:hover:text-red-400"
                >
                  {trait} ✕
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Traits
          {traits.length > 0 && <span className="text-sm font-normal text-slate-500">({traits.length})</span>}
        </h2>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
        >
          Edit
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {traits.length === 0 && <p className="text-sm text-slate-500">No traits selected.</p>}
        {selectedInCatalogOrder.map((trait) => (
          <TraitChip key={trait.name} name={trait.name} category={trait.category} />
        ))}
        {legacyTraits.map((name) => (
          <span
            key={name}
            className="rounded-full border border-dashed border-slate-400 px-3 py-1 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400"
          >
            {name}
          </span>
        ))}
      </div>

      {editing && (
        <TraitEditorModal
          catalog={catalog}
          traits={traits}
          legacyTraits={legacyTraits}
          onToggle={toggle}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}
