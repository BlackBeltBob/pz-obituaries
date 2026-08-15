import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import type { PoiCatalogEntry } from '../../shared/obituary'

const POIS_FILE = path.resolve(import.meta.dirname, '../catalog/pois.json')

const router = Router()

router.get('/', async (_req, res) => {
  const raw = await fs.readFile(POIS_FILE, 'utf-8')
  res.json(JSON.parse(raw) as Record<string, PoiCatalogEntry[]>)
})

export default router
