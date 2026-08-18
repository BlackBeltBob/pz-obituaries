import { Router } from 'express'
import type { CreateObituaryInput, Obituary, SubmitDeathInput, UpdateObituaryInput } from '../../shared/obituary'
import * as storage from '../storage'
import { upload } from '../upload'

const router = Router()

router.get('/', async (_req, res) => {
  res.json(await storage.getAll())
})

router.get('/:slug', async (req, res) => {
  const obituary = await storage.getBySlug(req.params.slug)
  if (!obituary) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(obituary)
})

router.post('/', async (req, res) => {
  const input = req.body as CreateObituaryInput
  const slug = await storage.uniqueSlug(input.name)
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
  await storage.save(obituary)
  res.status(201).json(obituary)
})

router.put('/:slug', async (req, res) => {
  const existing = await storage.getBySlug(req.params.slug)
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const input = req.body as UpdateObituaryInput
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
  await storage.save(updated)
  res.json(updated)
})

router.delete('/:slug', async (req, res) => {
  const existing = await storage.getBySlug(req.params.slug)
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  await storage.remove(req.params.slug)
  res.status(204).end()
})

router.post('/:slug/death', async (req, res) => {
  const existing = await storage.getBySlug(req.params.slug)
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  if (existing.status === 'deceased') {
    res.status(409).json({ error: 'Character is already deceased' })
    return
  }
  const input = req.body as SubmitDeathInput
  const updated: Obituary = {
    ...existing,
    status: 'deceased',
    causeOfDeath: input.causeOfDeath,
    runLength: input.runLength,
    restingPlaceScreenshot: input.restingPlaceScreenshot,
    favouriteWeapon: input.favouriteWeapon,
    weight: input.weight,
  }
  await storage.save(updated)
  res.json(updated)
})

router.post('/:slug/images', upload.single('image'), async (req, res) => {
  const slug = req.params.slug as string
  const existing = await storage.getBySlug(slug)
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' })
    return
  }
  const imagePath = `/obituaries/${slug}/${req.file.filename}`
  const updated: Obituary = { ...existing, images: [...existing.images, imagePath] }
  await storage.save(updated)
  res.json(updated)
})

export default router
