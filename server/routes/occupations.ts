import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'

const OCCUPATIONS_FILE = path.resolve(import.meta.dirname, '../data/occupations.json')

const router = Router()

router.get('/', async (_req, res) => {
  const raw = await fs.readFile(OCCUPATIONS_FILE, 'utf-8')
  res.json(JSON.parse(raw) as string[])
})

export default router
