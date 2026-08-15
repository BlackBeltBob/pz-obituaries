import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import type { TraitDefinition } from '../../shared/obituary'

const TRAITS_FILE = path.resolve(import.meta.dirname, '../catalog/traits.json')

const router = Router()

router.get('/', async (_req, res) => {
  const raw = await fs.readFile(TRAITS_FILE, 'utf-8')
  res.json(JSON.parse(raw) as TraitDefinition[])
})

export default router
