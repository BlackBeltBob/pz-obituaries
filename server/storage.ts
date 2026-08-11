import fs from 'node:fs/promises'
import path from 'node:path'
import type { JournalEntry, Obituary } from '../shared/obituary'

const DATA_DIR = path.resolve(import.meta.dirname, 'data/obituaries')

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// A POI's `notes` field used to be a single overwritable string; now it's a
// log of dated journal entries. Wrap any legacy string into a one-entry log.
function normalizeNotes(notes: unknown): JournalEntry[] {
  if (Array.isArray(notes)) return notes as JournalEntry[]
  if (typeof notes === 'string' && notes.trim()) {
    return [{ id: 'legacy', text: notes, day: null, createdAt: new Date(0).toISOString() }]
  }
  return []
}

// Old character files predate fields like `traits`, `gameMode`,
// `startingLocation`, `occupation`, `currentDay`, `skills`, `routines`, and
// the visited/cleared/looted flags on a POI entry; default them in rather
// than letting readers of this data crash on `undefined`.
function normalize(raw: unknown): Obituary {
  const obituary = raw as Obituary
  return {
    ...obituary,
    traits: obituary.traits ?? [],
    gameMode: obituary.gameMode ?? '',
    startingLocation: obituary.startingLocation ?? '',
    occupation: obituary.occupation ?? '',
    currentDay: obituary.currentDay ?? null,
    skills: obituary.skills ?? [],
    routines: obituary.routines ?? [],
    pointsOfInterest: (obituary.pointsOfInterest ?? []).map((poi) => ({
      ...poi,
      visited: poi.visited ?? false,
      cleared: poi.cleared ?? false,
      looted: poi.looted ?? false,
      notes: normalizeNotes(poi.notes),
    })),
  }
}

export async function getAll(): Promise<Obituary[]> {
  const files = await fs.readdir(DATA_DIR)
  const obituaries = await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => normalize(JSON.parse(await fs.readFile(path.join(DATA_DIR, f), 'utf-8')))),
  )
  return obituaries.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getBySlug(slug: string): Promise<Obituary | undefined> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${slug}.json`), 'utf-8')
    return normalize(JSON.parse(raw))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw err
  }
}

export async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name)
  let candidate = base
  let suffix = 2
  while (await getBySlug(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  return candidate
}

export async function save(obituary: Obituary): Promise<void> {
  await fs.writeFile(path.join(DATA_DIR, `${obituary.slug}.json`), JSON.stringify(obituary, null, 2))
}
