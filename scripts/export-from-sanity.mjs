import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const client = createClient({
  projectId: 'm6hc4vjm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
})

function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

async function exportContentType({ type, folder, fields, omitFromIndex }) {
  console.log(`Fetching ${folder}...`)
  const docs = await client.fetch(
    `*[_type == "${type}" && defined(slug.current)] | order(_createdAt asc) { ${fields} }`
  )

  const dir = path.join(projectRoot, 'content', folder)

  for (const doc of docs) {
    saveJson(path.join(dir, `${doc.slug.current}.json`), doc)
  }

  const index = docs.map(doc => {
    const entry = { ...doc }
    for (const field of omitFromIndex) delete entry[field]
    return entry
  })
  saveJson(path.join(dir, 'index.json'), index)

  return docs.length
}

async function main() {
  console.log('Exporting content from Sanity...\n')

  const contentTypes = [
    {
      type: 'technicalDocument',
      folder: 'technical-docs',
      fields: '_id, title, slug, _createdAt, image, headerImage, markdown',
      omitFromIndex: ['markdown']
    },
    {
      type: 'secretTechnicalDocument',
      folder: 'secret-technical-docs',
      fields: '_id, title, slug, _createdAt, image, headerImage, markdown',
      omitFromIndex: ['markdown']
    },
    {
      type: 'speech',
      folder: 'speeches',
      fields: '_id, title, slug, _createdAt, headerImage, markdown',
      omitFromIndex: ['markdown']
    },
    {
      type: 'conceptArt',
      folder: 'concept-art',
      fields: '_id, title, slug, _createdAt, headerImage, images, description',
      omitFromIndex: ['images', 'description']
    }
  ]

  for (const config of contentTypes) {
    const count = await exportContentType(config)
    console.log(`✓ ${count} ${config.folder}`)
  }

  console.log('\nExport complete! Content saved to ./content/')
}

main().catch(err => {
  console.error('Export failed:', err)
  process.exit(1)
})
