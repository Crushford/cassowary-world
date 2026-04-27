import fs from 'fs'
import path from 'path'

const contentRoot = path.join(process.cwd(), 'content')

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
  } catch {
    return null
  }
}

export function getContentIndex<T>(folder: string): T[] {
  return readJson<T[]>(path.join(contentRoot, folder, 'index.json')) ?? []
}

export function getContentDoc<T>(folder: string, slug: string): T | null {
  return readJson<T>(path.join(contentRoot, folder, `${slug}.json`))
}
