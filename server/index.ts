import path from 'node:path'
import cors from 'cors'
import express from 'express'
import obituariesRouter from './routes/obituaries'
import poisRouter from './routes/pois'
import traitsRouter from './routes/traits'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use('/obituaries', express.static(path.resolve(import.meta.dirname, '../public/obituaries')))
app.use('/api/obituaries', obituariesRouter)
app.use('/api/traits', traitsRouter)
app.use('/api/pois', poisRouter)

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
