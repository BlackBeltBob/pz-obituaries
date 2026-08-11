import { useEffect, useState } from 'react'
import type { TraitCategory, TraitDefinition } from '../../shared/obituary'
import { getTraitsCatalog } from '../lib/api'

interface TraitPickerProps {
  traits: string[]
  onChange: (traits: string[]) => void
}

const categoryStyles: Record<TraitCategory, { selected: string; unselected: string }> = {
  positive: {
    selected: 'border-emerald-500 bg-emerald-600 text-white',
    unselected: 'border-emerald-800 bg-emerald-950/40 text-emerald-400 hover:border-emerald-600',
  },
  negative: {
    selected: 'border-red-500 bg-red-600 text-white',
    unselected: 'border-red-800 bg-red-950/40 text-red-400 hover:border-red-600',
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

export function TraitPicker({ traits, onChange }: TraitPickerProps) {
  const [catalog, setCatalog] = useState<TraitDefinition[] | null>(null)

  useEffect(() => {
    getTraitsCatalog().then(setCatalog)
  }, [])

  function toggle(trait: string) {
    onChange(traits.includes(trait) ? traits.filter((t) => t !== trait) : [...traits, trait])
  }

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading traits...</p>
  }

  const catalogNames = new Set(catalog.map((t) => t.name))
  const legacyTraits = traits.filter((t) => !catalogNames.has(t))

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-lg font-semibold text-slate-100">
        <span className="inline-block text-slate-500 transition-transform group-open:rotate-90">›</span>
        Traits
        {traits.length > 0 && <span className="text-sm font-normal text-slate-500">({traits.length})</span>}
      </summary>

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
                className="rounded-full border border-dashed border-slate-600 px-3 py-1 text-sm text-slate-400 hover:border-red-500 hover:text-red-400"
              >
                {trait} ✕
              </button>
            ))}
          </div>
        </div>
      )}
    </details>
  )
}
