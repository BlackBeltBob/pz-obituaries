import { useEffect, useState } from 'react'
import type { SkillEntry } from '../../shared/obituary'
import { getSkillsCatalog } from '../lib/api'

interface SkillsPickerProps {
  skills: SkillEntry[]
  onChange: (skills: SkillEntry[]) => void
}

const MAX_LEVEL = 10

export function SkillsPicker({ skills, onChange }: SkillsPickerProps) {
  const [catalog, setCatalog] = useState<string[] | null>(null)

  useEffect(() => {
    getSkillsCatalog().then(setCatalog)
  }, [])

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading skills...</p>
  }

  const levelByName = new Map(skills.map((s) => [s.name, s.level]))

  function setLevel(name: string, level: number) {
    const clamped = Math.max(0, Math.min(MAX_LEVEL, level))
    if (clamped === 0) {
      onChange(skills.filter((s) => s.name !== name))
    } else if (levelByName.has(name)) {
      onChange(skills.map((s) => (s.name === name ? { ...s, level: clamped } : s)))
    } else {
      onChange([...skills, { name, level: clamped }])
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Skills</h2>
      <div className="mt-2 grid grid-cols-1 gap-1.5 @sm:grid-cols-2">
        {catalog.map((name) => {
          const level = levelByName.get(name) ?? 0
          return (
            <div
              key={name}
              className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1.5 dark:border-slate-800"
            >
              <span className={`text-sm ${level > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                {name}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLevel(name, level - 1)}
                  disabled={level === 0}
                  aria-label={`Decrease ${name}`}
                  className="flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-xs text-slate-600 hover:border-slate-500 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
                >
                  −
                </button>
                <span className="w-4 text-center text-sm text-slate-800 dark:text-slate-200">{level}</span>
                <button
                  type="button"
                  onClick={() => setLevel(name, level + 1)}
                  disabled={level === MAX_LEVEL}
                  aria-label={`Increase ${name}`}
                  className="flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-xs text-slate-600 hover:border-slate-500 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
