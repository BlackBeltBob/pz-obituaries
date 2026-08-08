import { useEffect, useState } from 'react'
import type { Obituary } from '../../shared/obituary'
import { getAllObituaries } from '../lib/api'
import { NewCharacterForm } from './NewCharacterForm'
import { ObituaryCard } from './ObituaryCard'

export function ObituaryList() {
  const [obituaries, setObituaries] = useState<Obituary[] | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    getAllObituaries().then(setObituaries)
  }, [])

  if (!obituaries) {
    return <p className="p-8 text-center text-slate-400">Loading...</p>
  }

  const living = obituaries.filter((o) => o.status === 'living')
  const deceased = obituaries.filter((o) => o.status === 'deceased')

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">pz-obituaries</h1>
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + New Character
        </button>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-200">Still Kicking</h2>
        {living.length === 0 ? (
          <p className="mt-2 text-slate-500">No one's alive right now.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {living.map((o) => (
              <ObituaryCard key={o.slug} obituary={o} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-200">Hall of the Fallen</h2>
        {deceased.length === 0 ? (
          <p className="mt-2 text-slate-500">No one's died yet. Give it time.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deceased.map((o) => (
              <ObituaryCard key={o.slug} obituary={o} />
            ))}
          </div>
        )}
      </section>

      {showNewForm && (
        <NewCharacterForm
          onClose={() => setShowNewForm(false)}
          onCreated={(obituary) => {
            setObituaries((prev) => [...(prev ?? []), obituary])
            setShowNewForm(false)
          }}
        />
      )}
    </div>
  )
}
