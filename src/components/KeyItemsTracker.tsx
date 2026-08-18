import { useEffect, useState, type KeyboardEvent } from 'react'
import type { CharacterItem, ItemDefinition } from '../../shared/obituary'
import { getItemsCatalog } from '../lib/api'

interface KeyItemsTrackerProps {
  items: CharacterItem[]
  onChange: (items: CharacterItem[]) => void
}

function ItemTile({
  name,
  iconUrl,
  quantity,
  onIncrement,
  onDecrement,
}: {
  name: string
  iconUrl: string
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
}) {
  return (
    <button
      type="button"
      onClick={onIncrement}
      onContextMenu={(e) => {
        e.preventDefault()
        onDecrement()
      }}
      aria-label={name}
      title={`${name}\nLeft-click: +1, Right-click: -1`}
      className="relative flex h-12 w-12 items-center justify-center rounded border border-slate-300 bg-white hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
    >
      {iconUrl ? (
        <img src={iconUrl} alt={name} draggable={false} className="h-8 w-8 object-contain" />
      ) : (
        <span className="px-0.5 text-center text-[9px] leading-tight text-slate-500 dark:text-slate-400">
          {name}
        </span>
      )}
      {quantity > 0 && (
        <span className="absolute -bottom-1 -right-1 rounded bg-amber-500 px-1 text-[10px] font-bold leading-none text-slate-900">
          {quantity < 10 ? `0${quantity}` : quantity}
        </span>
      )}
    </button>
  )
}

export function KeyItemsTracker({ items, onChange }: KeyItemsTrackerProps) {
  const [catalog, setCatalog] = useState<ItemDefinition[] | null>(null)
  const [addingCustom, setAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')

  useEffect(() => {
    getItemsCatalog().then(setCatalog)
  }, [])

  if (!catalog) {
    return <p className="text-sm text-slate-500">Loading items...</p>
  }

  const catalogNames = new Set(catalog.map((i) => i.name))
  const quantityByName = new Map(items.map((i) => [i.name, i.quantity]))
  const customItems = items.filter((i) => !catalogNames.has(i.name))

  function adjust(name: string, delta: number) {
    const next = Math.max(0, (quantityByName.get(name) ?? 0) + delta)
    if (next === 0) {
      onChange(items.filter((i) => i.name !== name))
    } else if (quantityByName.has(name)) {
      onChange(items.map((i) => (i.name === name ? { ...i, quantity: next } : i)))
    } else {
      onChange([...items, { name, quantity: next }])
    }
  }

  function cancelAddCustom() {
    setAddingCustom(false)
    setCustomName('')
  }

  function commitCustom() {
    const name = customName.trim()
    if (!name || catalogNames.has(name) || quantityByName.has(name)) {
      cancelAddCustom()
      return
    }
    onChange([...items, { name, quantity: 1 }])
    cancelAddCustom()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') cancelAddCustom()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Key Items</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {catalog.map((item) => (
          <ItemTile
            key={item.name}
            name={item.name}
            iconUrl={item.iconUrl}
            quantity={quantityByName.get(item.name) ?? 0}
            onIncrement={() => adjust(item.name, 1)}
            onDecrement={() => adjust(item.name, -1)}
          />
        ))}
        {customItems.map((item) => (
          <ItemTile
            key={item.name}
            name={item.name}
            iconUrl=""
            quantity={item.quantity}
            onIncrement={() => adjust(item.name, 1)}
            onDecrement={() => adjust(item.name, -1)}
          />
        ))}
        {addingCustom ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              commitCustom()
            }}
          >
            <input
              autoFocus
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onBlur={commitCustom}
              onKeyDown={handleKeyDown}
              placeholder="Item name"
              className="h-12 w-28 rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCustom(true)}
            title="Track a custom item"
            aria-label="Track a custom item"
            className="flex h-12 w-12 items-center justify-center rounded border border-dashed border-slate-300 text-lg text-slate-500 hover:border-slate-500 hover:text-slate-800 dark:border-slate-700 dark:hover:text-slate-300"
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}
