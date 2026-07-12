import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import express from 'express'
import { createApp, initDirectories } from './server.js'
import { readFileSync, writeFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

initDirectories()

// Migrate existing SKUs: remove hyphens (ANN-JW-NS-001 → ANNJWNS001)
try {
  const dataDir = join(__dirname, 'data')
  const productsPath = join(dataDir, 'products.json')
  if (existsSync(productsPath)) {
    const products = JSON.parse(readFileSync(productsPath, 'utf8'))
    let changed = false
    const migrated = products.map(p => {
      if (p.sku && p.sku.includes('-')) {
        changed = true
        return { ...p, sku: p.sku.replace(/-/g, '') }
      }
      return p
    })
    if (changed) {
      writeFileSync(productsPath, JSON.stringify(migrated, null, 2))
      console.log('✓ Migrated product SKUs: removed hyphens')
    }
  }
} catch (e) {
  console.warn('SKU migration skipped:', e.message)
}

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
