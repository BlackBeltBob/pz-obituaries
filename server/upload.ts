import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'

const PUBLIC_OBITUARIES_DIR = path.resolve(import.meta.dirname, '../public/obituaries')

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(PUBLIC_OBITUARIES_DIR, req.params.slug as string)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, `${Date.now()}-${safeName}`)
  },
})

export const upload = multer({ storage })
