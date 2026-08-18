import type {
  CreateObituaryInput,
  ItemDefinition,
  Obituary,
  PoiCatalogEntry,
  SubmitDeathInput,
  TraitDefinition,
  UpdateObituaryInput,
} from '../../shared/obituary'
import itemsCatalog from '../data/items.json'
import occupationsCatalog from '../data/occupations.json'
import poisCatalog from '../data/pois.json'
import skillbooksCatalog from '../data/skillbooks.json'
import skillsCatalog from '../data/skills.json'
import traitsCatalog from '../data/traits.json'
import * as db from './db'

export async function getAllObituaries(): Promise<Obituary[]> {
  return db.getAll()
}

export async function getObituaryBySlug(slug: string): Promise<Obituary | undefined> {
  return db.getBySlug(slug)
}

export async function createObituary(input: CreateObituaryInput): Promise<Obituary> {
  const slug = await db.uniqueSlug(input.name)
  const obituary: Obituary = {
    slug,
    name: input.name,
    gameMode: input.gameMode,
    startingLocation: input.startingLocation,
    occupation: input.occupation,
    currentDay: null,
    goals: input.goals,
    memorableMoments: input.memorableMoments,
    traits: input.traits,
    skills: [],
    skillbooks: [],
    routines: [],
    bases: [],
    selectedBaseId: null,
    images: [],
    pointsOfInterest: [],
    items: [],
    status: 'living',
  }
  await db.save(obituary)
  return obituary
}

export async function updateObituary(slug: string, input: UpdateObituaryInput): Promise<Obituary> {
  const existing = await db.getRaw(slug)
  if (!existing) throw new Error('Not found')
  const updated: Obituary = {
    ...existing,
    goals: input.goals,
    memorableMoments: input.memorableMoments,
    traits: input.traits,
    pointsOfInterest: input.pointsOfInterest,
    skills: input.skills,
    skillbooks: input.skillbooks,
    routines: input.routines,
    currentDay: input.currentDay,
    bases: input.bases,
    selectedBaseId: input.selectedBaseId,
    items: input.items,
  }
  await db.save(updated)
  return db.resolveObituary(updated)
}

export async function deleteObituary(slug: string): Promise<void> {
  const existing = await db.getRaw(slug)
  if (!existing) throw new Error('Not found')
  await db.remove(slug)
}

export async function submitDeath(slug: string, input: SubmitDeathInput): Promise<Obituary> {
  const existing = await db.getRaw(slug)
  if (!existing) throw new Error('Not found')
  if (existing.status === 'deceased') throw new Error('Character is already deceased')
  const updated: Obituary = {
    ...existing,
    status: 'deceased',
    causeOfDeath: input.causeOfDeath,
    runLength: input.runLength,
    // The form builds this from an already-resolved `images` entry, so it
    // may be this session's object URL rather than the underlying photo id
    // -- translate it back before persisting (see db.toRawRef).
    restingPlaceScreenshot: db.toRawRef(input.restingPlaceScreenshot),
    favouriteWeapon: input.favouriteWeapon,
    weight: input.weight,
  }
  await db.save(updated)
  return db.resolveObituary(updated)
}

export async function uploadImage(slug: string, file: File): Promise<Obituary> {
  const existing = await db.getRaw(slug)
  if (!existing) throw new Error('Not found')
  const id = await db.savePhoto(file)
  const updated: Obituary = { ...existing, images: [...existing.images, id] }
  await db.save(updated)
  return db.resolveObituary(updated)
}

export async function getTraitsCatalog(): Promise<TraitDefinition[]> {
  return traitsCatalog as TraitDefinition[]
}

export async function getItemsCatalog(): Promise<ItemDefinition[]> {
  return itemsCatalog as ItemDefinition[]
}

export async function getPoisCatalog(): Promise<Record<string, PoiCatalogEntry[]>> {
  return poisCatalog as Record<string, PoiCatalogEntry[]>
}

export async function getOccupationsCatalog(): Promise<string[]> {
  return occupationsCatalog
}

export async function getSkillsCatalog(): Promise<string[]> {
  return skillsCatalog
}

export async function getSkillbooksCatalog(): Promise<string[]> {
  return skillbooksCatalog
}

export async function exportData(): Promise<Blob> {
  const bundle = await db.exportAll()
  return new Blob([JSON.stringify(bundle)], { type: 'application/json' })
}

export async function importData(file: File): Promise<void> {
  const bundle = JSON.parse(await file.text()) as db.ExportBundle
  await db.importAll(bundle)
}
