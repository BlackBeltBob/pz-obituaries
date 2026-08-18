import localforage from 'localforage'
import type { Obituary } from '../../shared/obituary'
import seedObituaries from '../data/seed-obituaries.json'

const obituariesStore = localforage.createInstance({ name: 'pz-obituaries', storeName: 'obituaries' })
const photosStore = localforage.createInstance({ name: 'pz-obituaries', storeName: 'photos' })

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Photos are stored as Blobs keyed by a generated id; obituary records
// reference photos by that id, never by URL (URL.createObjectURL output is
// only valid for the current page session and can't be persisted). These
// two maps translate between a stable id and this session's object URL in
// both directions -- the reverse map matters because components only ever
// see resolved URLs (see resolveObituary below), so a value like
// DeathForm's `restingPlaceScreenshot` -- copied from an already-resolved
// `images` entry -- has to be translated back to its id before being saved.
const objectUrlCache = new Map<string, string>()
const reverseUrlCache = new Map<string, string>()

async function resolvePhotoRef(ref: string): Promise<string> {
  if (!ref) return ref
  const cached = objectUrlCache.get(ref)
  if (cached) return cached
  const blob = await photosStore.getItem<Blob>(ref)
  if (!blob) return ref // not a known photo id -- legacy path or empty, pass through
  const url = URL.createObjectURL(blob)
  objectUrlCache.set(ref, url)
  reverseUrlCache.set(url, ref)
  return url
}

// Translates a value that may be a resolved object URL back to the photo id
// it came from. Values that aren't a known object URL (empty string, a
// legacy static path) pass through unchanged.
export function toRawRef(value: string): string {
  return reverseUrlCache.get(value) ?? value
}

async function revokeAndDeletePhoto(ref: string): Promise<void> {
  if (!ref) return
  const cached = objectUrlCache.get(ref)
  if (cached) {
    URL.revokeObjectURL(cached)
    objectUrlCache.delete(ref)
    reverseUrlCache.delete(cached)
  }
  await photosStore.removeItem(ref)
}

export async function resolveObituary(raw: Obituary): Promise<Obituary> {
  const images = await Promise.all(raw.images.map(resolvePhotoRef))
  if (raw.status === 'deceased') {
    const restingPlaceScreenshot = await resolvePhotoRef(raw.restingPlaceScreenshot)
    return { ...raw, images, restingPlaceScreenshot }
  }
  return { ...raw, images }
}

let seeded: Promise<void> | null = null

function ensureSeeded(): Promise<void> {
  if (!seeded) {
    seeded = (async () => {
      const keys = await obituariesStore.keys()
      if (keys.length > 0) return
      await Promise.all((seedObituaries as Obituary[]).map((o) => obituariesStore.setItem(o.slug, o)))
    })()
  }
  return seeded
}

export async function getAllRaw(): Promise<Obituary[]> {
  await ensureSeeded()
  const results: Obituary[] = []
  await obituariesStore.iterate<Obituary, void>((value) => {
    results.push(value)
  })
  return results
}

export async function getAll(): Promise<Obituary[]> {
  const raws = await getAllRaw()
  const resolved = await Promise.all(raws.map(resolveObituary))
  return resolved.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getRaw(slug: string): Promise<Obituary | undefined> {
  await ensureSeeded()
  const raw = await obituariesStore.getItem<Obituary>(slug)
  return raw ?? undefined
}

export async function getBySlug(slug: string): Promise<Obituary | undefined> {
  const raw = await getRaw(slug)
  if (!raw) return undefined
  return resolveObituary(raw)
}

export async function uniqueSlug(name: string): Promise<string> {
  await ensureSeeded()
  const base = slugify(name)
  let candidate = base
  let suffix = 2
  while ((await obituariesStore.getItem(candidate)) !== null) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  return candidate
}

export async function save(obituary: Obituary): Promise<void> {
  await obituariesStore.setItem(obituary.slug, obituary)
}

export async function remove(slug: string): Promise<void> {
  const existing = await obituariesStore.getItem<Obituary>(slug)
  if (existing) {
    await Promise.all(existing.images.map(revokeAndDeletePhoto))
    if (existing.status === 'deceased') await revokeAndDeletePhoto(existing.restingPlaceScreenshot)
  }
  await obituariesStore.removeItem(slug)
}

export async function savePhoto(blob: Blob): Promise<string> {
  const id = crypto.randomUUID()
  await photosStore.setItem(id, blob)
  return id
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

export interface ExportBundle {
  version: 1
  exportedAt: string
  obituaries: Obituary[]
  photos: Record<string, string>
}

export async function exportAll(): Promise<ExportBundle> {
  const obituaries = await getAllRaw()
  const photoIds = new Set<string>()
  for (const o of obituaries) {
    o.images.forEach((id) => photoIds.add(id))
    if (o.status === 'deceased' && o.restingPlaceScreenshot) photoIds.add(o.restingPlaceScreenshot)
  }
  const photos: Record<string, string> = {}
  await Promise.all(
    [...photoIds].map(async (id) => {
      const blob = await photosStore.getItem<Blob>(id)
      if (blob) photos[id] = await blobToDataUrl(blob)
    }),
  )
  return { version: 1, exportedAt: new Date().toISOString(), obituaries, photos }
}

export async function importAll(bundle: ExportBundle): Promise<void> {
  await Promise.all(
    Object.entries(bundle.photos).map(async ([id, dataUrl]) => {
      await photosStore.setItem(id, await dataUrlToBlob(dataUrl))
    }),
  )
  await Promise.all(bundle.obituaries.map((o) => obituariesStore.setItem(o.slug, o)))
}
