import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import type { ItemDefinition } from '../../shared/obituary'

const ITEMS_FILE = path.resolve(import.meta.dirname, '../catalog/items.json')

const router = Router()

router.get('/', async (_req, res) => {
  const raw = await fs.readFile(ITEMS_FILE, 'utf-8')
  res.json(JSON.parse(raw) as ItemDefinition[])
})

export default router
