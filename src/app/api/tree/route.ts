import { getTree } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ref = searchParams.get('ref') ?? 'main'
  const tree = await getTree(ref)
  return NextResponse.json(tree)
}
