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

export interface PointOfInterestEntry {
  name: string
  visited: boolean
  cleared: boolean
  looted: boolean
  goals: Goal[]
  notes: string
}

interface ObituaryBase {
  slug: string
  name: string
  gameMode: string
  startingLocation: string
  goals: Goal[]
  memorableMoments: string[]
  images: string[]
  traits: string[]
  pointsOfInterest: PointOfInterestEntry[]
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
  goals: Goal[]
  memorableMoments: string[]
  traits: string[]
}

export interface UpdateObituaryInput {
  goals: Goal[]
  memorableMoments: string[]
  traits: string[]
  pointsOfInterest: PointOfInterestEntry[]
}

export interface SubmitDeathInput {
  causeOfDeath: string
  runLength: RunDuration
  restingPlaceScreenshot: string
  favouriteWeapon: string
  weight: number
}
