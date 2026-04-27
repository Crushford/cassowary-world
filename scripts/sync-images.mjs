import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const src = path.join(projectRoot, 'content', 'images')
const dest = path.join(projectRoot, 'public', 'content-images')

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true })
  console.log('Synced content/images → public/content-images')
}
