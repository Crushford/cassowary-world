import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const contentRoot = path.join(projectRoot, 'content')
const imagesDir = path.join(projectRoot, 'public', 'content-images')

fs.mkdirSync(imagesDir, { recursive: true })

function refToImage(ref) {
  const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/)
  if (!match) return null
  const [, hash, dims, format] = match
  return {
    cdnUrl: `https://cdn.sanity.io/images/m6hc4vjm/production/${hash}-${dims}.${format}`,
    localPath: `/content-images/${hash}-${dims}.${format}`,
    filename: `${hash}-${dims}.${format}`
  }
}

async function downloadImage(cdnUrl, filename) {
  const dest = path.join(imagesDir, filename)
  if (fs.existsSync(dest)) return
  const res = await fetch(cdnUrl)
  if (!res.ok) throw new Error(`Failed to download ${cdnUrl}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buf)
  console.log(`  Downloaded ${filename}`)
}

function transformImageRefs(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(transformImageRefs)

  // Replace Sanity image objects with local path strings
  if (obj._type === 'image' && obj.asset?._ref) {
    const img = refToImage(obj.asset._ref)
    return img ? img.localPath : null
  }

  const result = {}
  for (const [key, val] of Object.entries(obj)) {
    result[key] = transformImageRefs(val)
  }
  return result
}

function collectRefs(obj, refs = new Set()) {
  if (!obj || typeof obj !== 'object') return refs
  if (Array.isArray(obj)) { obj.forEach(v => collectRefs(v, refs)); return refs }
  if (obj._type === 'image' && obj.asset?._ref) { refs.add(obj.asset._ref); return refs }
  Object.values(obj).forEach(v => collectRefs(v, refs))
  return refs
}

async function processDir(folder) {
  const dir = path.join(contentRoot, folder)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json')

  for (const file of files) {
    const filePath = path.join(dir, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    // Collect and download all images first
    const refs = collectRefs(data)
    for (const ref of refs) {
      const img = refToImage(ref)
      if (img) await downloadImage(img.cdnUrl, img.filename)
    }

    // Rewrite the JSON with local paths
    const transformed = transformImageRefs(data)
    fs.writeFileSync(filePath, JSON.stringify(transformed, null, 2))

    // Also update index.json entries that may have image refs
  }

  // Rewrite index.json too
  const indexPath = path.join(dir, 'index.json')
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
    const refs = collectRefs(index)
    for (const ref of refs) {
      const img = refToImage(ref)
      if (img) await downloadImage(img.cdnUrl, img.filename)
    }
    fs.writeFileSync(indexPath, JSON.stringify(transformImageRefs(index), null, 2))
  }

  console.log(`✓ ${folder}`)
}

async function main() {
  console.log('Downloading images and rewriting content refs...\n')
  const folders = ['technical-docs', 'secret-technical-docs', 'speeches', 'concept-art']
  for (const folder of folders) {
    await processDir(folder)
  }
  console.log('\nDone! Images saved to public/content-images/')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
