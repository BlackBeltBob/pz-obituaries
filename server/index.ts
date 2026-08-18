import fs from 'node:fs'
import path from 'node:path'
import express from 'express'

const { version } = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, '../package.json'), 'utf-8'),
) as { version: string }

const app = express()
const PORT = Number(process.env.PORT) || 3001

// All app data lives client-side in the visitor's own browser (IndexedDB) --
// this process only serves the built static frontend, nothing else.
const distDir = path.resolve(import.meta.dirname, '../dist')
app.use(express.static(distDir))
// SPA fallback: any route not matched above (e.g. /some-character-slug) is
// a client-side route, so hand back index.html and let React Router take
// over.
app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`pz-obituaries v${version} listening on http://localhost:${PORT}`)
})
