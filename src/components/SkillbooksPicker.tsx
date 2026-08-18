import { useEffect, useState } from 'react'
import { SKILLBOOK_TIER_COUNT, type SkillbookEntry } from '../../shared/obituary'
import { getSkillbooksCatalog } from '../lib/api'

interface SkillbooksPickerProps {
  skillbooks: SkillbookEntry[]
  onChange: (skillbooks: SkillbookEntry[]) => void
}

const EMPTY_TIERS = Array<boolean>(SKILLBOOK_TIER_COUNT).fill(false)

export function SkillbooksPicker({ skillbooks, onChange }: SkillbooksPickerProps) {
  const [catalog, setCatalog] = useState<string[] | null>(null)

  useEffect(() => {
    getSkillbooksCatalog().then(setCatalog)
  }, [])

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading skill books...</p>
  }

  const tiersByName = new Map(skillbooks.map((s) => [s.name, s.tiers]))

  function toggleTier(name: string, index: number) {
    const tiers = (tiersByName.get(name) ?? EMPTY_TIERS).map((owned, i) => (i === index ? !owned : owned))
    if (tiers.some(Boolean)) {
      onChange(
        tiersByName.has(name)
          ? skillbooks.map((s) => (s.name === name ? { ...s, tiers } : s))
          : [...skillbooks, { name, tiers }],
      )
    } else {
      onChange(skillbooks.filter((s) => s.name !== name))
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Skill Books</h2>
      <div className="mt-2 grid grid-cols-1 gap-1.5 @sm:grid-cols-2">
        {catalog.map((name) => {
          const tiers = tiersByName.get(name) ?? EMPTY_TIERS
          return (
            <div
              key={name}
              className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1.5 dark:border-slate-800"
            >
              <span
                className={`text-sm ${tiers.some(Boolean) ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}
              >
                {name}
              </span>
              <div className="flex shrink-0 divide-x divide-slate-300 overflow-hidden rounded border border-slate-300 dark:divide-slate-700 dark:border-slate-700">
                {tiers.map((owned, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-pressed={owned}
                    aria-label={`${name} skill book tier ${index + 1}`}
                    onClick={() => toggleTier(name, index)}
                    className={`h-6 w-6 text-xs transition ${
                      owned
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
