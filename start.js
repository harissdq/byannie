import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import express from 'express'
import { createApp, initDirectories } from './server.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

initDirectories()

const app = createApp()
const DIST_DIR = join(__dirname, 'dist')
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(DIST_DIR, 'index.html'))
    }
  })
  console.log('✓ Serving frontend from dist/')
}
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✓ Annie server running on http://localhost:${PORT}`)
})
