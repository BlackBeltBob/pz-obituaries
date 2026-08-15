export interface RunDuration {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
}

export interface Goal {
  description: string
  achieved: boolean
  tag?: string
}

export interface JournalEntry {
  id: string
  text: string
  day: number | null
  createdAt: string
}

export interface SkillEntry {
  name: string
  level: number
}

export const SKILLBOOK_TIER_COUNT = 5

export interface SkillbookEntry {
  name: string
  tiers: boolean[]
}

export interface Routine {
  id: string
  description: string
  cadence: string
  done: boolean
  lastDoneDay: number | null
}

// Coordinates match the projectzomboid.com map's system directly (same
// pixel coordinates the wiki lists for buildings), no conversion needed.
export interface Base {
  id: string
  label: string
  x: number
  y: number
}

export type TraitCategory = 'positive' | 'negative'

export interface TraitDefinition {
  name: string
  category: TraitCategory
}

// Standard playstyles plus the still-common legacy ones, per
// https://pzwiki.net/wiki/Game_modes
export const GAME_MODES = [
  'Apocalypse',
  'Outbreak',
  'Extinction',
  'Rising',
  'Custom Sandbox',
  'Survivor',
  'Builder',
  'Survival',
  'Initial Infection',
  'One Week Later',
  'Six Months Later',
] as const

// The four base-game starting towns plus the additional ones selectable via
// Sandbox, per https://pzwiki.net/wiki/Starting_location
export const STARTING_LOCATIONS = [
  'Muldraugh',
  'Riverside',
  'Rosewood',
  'West Point',
  'Brandenburg',
  'Echo Creek',
  'Ekron',
  'Fallas Lake',
  'Irvington',
  'March Ridge',
  'Valley Station',
] as const

export const POI_CATEGORIES = [
  'medical',
  'foods',
  'furniture',
  'warehouse',
  'utilities',
  'mechanics',
  'firearms',
  'other',
] as const

export type PoiCategory = (typeof POI_CATEGORIES)[number]

export interface PoiCatalogEntry {
  name: string
  category: PoiCategory
}

export const POI_STATUSES = ['unvisited', 'overrun', 'cleared', 'looted'] as const

export type PoiStatus = (typeof POI_STATUSES)[number]

export interface PointOfInterestEntry {
  name: string
  status: PoiStatus
  pinned: boolean
  goals: Goal[]
  notes: JournalEntry[]
}

interface ObituaryBase {
  slug: string
  name: string
  gameMode: string
  startingLocation: string
  occupation: string
  currentDay: number | null
  goals: Goal[]
  memorableMoments: string[]
  images: string[]
  traits: string[]
  skills: SkillEntry[]
  skillbooks: SkillbookEntry[]
  routines: Routine[]
  pointsOfInterest: PointOfInterestEntry[]
  bases: Base[]
  selectedBaseId: string | null
}

export interface LivingObituary extends ObituaryBase {
  status: 'living'
}

export interface DeceasedObituary extends ObituaryBase {
  status: 'deceased'
  causeOfDeath: string
  runLength: RunDuration
  restingPlaceScreenshot: string
  favouriteWeapon: string
  weight: number
}

export type Obituary = LivingObituary | DeceasedObituary

export interface CreateObituaryInput {
  name: string
  gameMode: string
  startingLocation: string
  occupation: string
  goals: Goal[]
  memorableMoments: string[]
  traits: string[]
}

export interface UpdateObituaryInput {
  goals: Goal[]
  memorableMoments: string[]
  traits: string[]
  pointsOfInterest: PointOfInterestEntry[]
  skills: SkillEntry[]
  skillbooks: SkillbookEntry[]
  routines: Routine[]
  currentDay: number | null
  bases: Base[]
  selectedBaseId: string | null
}

export interface SubmitDeathInput {
  causeOfDeath: string
  runLength: RunDuration
  restingPlaceScreenshot: string
  favouriteWeapon: string
  weight: number
}
