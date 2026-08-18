import fs from 'node:fs/promises'
import path from 'node:path'
import type { JournalEntry, Obituary, PoiStatus } from '../shared/obituary'

const DATA_DIR = path.resolve(import.meta.dirname, 'data/obituaries')
const PHOTOS_DIR = path.resolve(import.meta.dirname, '../public/obituaries')

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

// A POI's visited/cleared/looted independent flags were replaced by a single
// exclusive `status` following the unvisited -> overrun -> cleared -> looted
// progression. Fold the old flags into the furthest state they imply.
function normalizeStatus(poi: {
  status?: PoiStatus
  looted?: boolean
  cleared?: boolean
  visited?: boolean
}): PoiStatus {
  if (poi.status) return poi.status
  if (poi.looted) return 'looted'
  if (poi.cleared) return 'cleared'
  if (poi.visited) return 'overrun'
  return 'unvisited'
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
    skillbooks: obituary.skillbooks ?? [],
    routines: obituary.routines ?? [],
    bases: obituary.bases ?? [],
    selectedBaseId: obituary.selectedBaseId ?? null,
    pointsOfInterest: (obituary.pointsOfInterest ?? []).map((poi) => ({
      name: poi.name,
      goals: poi.goals ?? [],
      status: normalizeStatus(poi),
      pinned: poi.pinned ?? false,
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

export async function remove(slug: string): Promise<void> {
  await fs.unlink(path.join(DATA_DIR, `${slug}.json`))
  // Uploaded photos live outside DATA_DIR in a per-slug folder; not every
  // character has one, so a missing folder here isn't an error.
  await fs.rm(path.join(PHOTOS_DIR, slug), { recursive: true, force: true })
}
