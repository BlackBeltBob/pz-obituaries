import type {
  CreateObituaryInput,
  ItemDefinition,
  Obituary,
  PoiCatalogEntry,
  SubmitDeathInput,
  TraitDefinition,
  UpdateObituaryInput,
} from '../../shared/obituary'

const BASE_URL = '/api/obituaries'

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? `Request failed with ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function getAllObituaries(): Promise<Obituary[]> {
  return parseOrThrow(await fetch(BASE_URL))
}

export async function getObituaryBySlug(slug: string): Promise<Obituary | undefined> {
  const res = await fetch(`${BASE_URL}/${slug}`)
  if (res.status === 404) return undefined
  return parseOrThrow(res)
}

export async function createObituary(input: CreateObituaryInput): Promise<Obituary> {
  return parseOrThrow(
    await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  )
}

export async function updateObituary(slug: string, input: UpdateObituaryInput): Promise<Obituary> {
  return parseOrThrow(
    await fetch(`${BASE_URL}/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  )
}

export async function deleteObituary(slug: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${slug}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? `Request failed with ${res.status}`)
  }
}

export async function submitDeath(slug: string, input: SubmitDeathInput): Promise<Obituary> {
  return parseOrThrow(
    await fetch(`${BASE_URL}/${slug}/death`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  )
}

export async function uploadImage(slug: string, file: File): Promise<Obituary> {
  const formData = new FormData()
  formData.append('image', file)
  return parseOrThrow(
    await fetch(`${BASE_URL}/${slug}/images`, {
      method: 'POST',
      body: formData,
    }),
  )
}

export async function getTraitsCatalog(): Promise<TraitDefinition[]> {
  return parseOrThrow(await fetch('/api/traits'))
}

export async function getItemsCatalog(): Promise<ItemDefinition[]> {
  return parseOrThrow(await fetch('/api/items'))
}

export async function getPoisCatalog(): Promise<Record<string, PoiCatalogEntry[]>> {
  return parseOrThrow(await fetch('/api/pois'))
}

export async function getOccupationsCatalog(): Promise<string[]> {
  return parseOrThrow(await fetch('/api/occupations'))
}

export async function getSkillsCatalog(): Promise<string[]> {
  return parseOrThrow(await fetch('/api/skills'))
}

export async function getSkillbooksCatalog(): Promise<string[]> {
  return parseOrThrow(await fetch('/api/skillbooks'))
}
