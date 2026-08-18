
import fs from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import express from 'express'
import itemsRouter from './routes/items'
import obituariesRouter from './routes/obituaries'
import occupationsRouter from './routes/occupations'
import poisRouter from './routes/pois'
import skillbooksRouter from './routes/skillbooks'
import skillsRouter from './routes/skills'
import traitsRouter from './routes/traits'

const { version } = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, '../package.json'), 'utf-8'),
) as { version: string }

const app = express()
const PORT = Number(process.env.PORT) || 3001
const isProduction = process.env.NODE_ENV === 'production'


// In dev, the Vite dev server (5173) and this API (3001) are different
// origins, so CORS is required. In production they're served from the same
// origin/port, and skipping it means a cross-site page can't fire writes
// against this unauthenticated API via a CORS preflight.
if (!isProduction) {
  app.use(cors())
}
app.use(express.json())
app.use('/obituaries', express.static(path.resolve(import.meta.dirname, '../public/obituaries')))
app.use('/api/obituaries', obituariesRouter)
app.use('/api/traits', traitsRouter)
app.use('/api/pois', poisRouter)
app.use('/api/occupations', occupationsRouter)
app.use('/api/skills', skillsRouter)
app.use('/api/skillbooks', skillbooksRouter)
app.use('/api/items', itemsRouter)

if (isProduction) {
  const distDir = path.resolve(import.meta.dirname, '../dist')
  app.use(express.static(distDir))
  // SPA fallback: any route not matched above (e.g. /some-character-slug)
  // is a client-side route, so hand back index.html and let React Router
  // take over.
  app.use((_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`pz-obituaries v${version} listening on http://localhost:${PORT}`)
})
