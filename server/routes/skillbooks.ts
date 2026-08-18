import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'

const SKILLBOOKS_FILE = path.resolve(import.meta.dirname, '../catalog/skillbooks.json')

const router = Router()

router.get('/', async (_req, res) => {
  const raw = await fs.readFile(SKILLBOOKS_FILE, 'utf-8')
  res.json(JSON.parse(raw) as string[])
})

export default router
