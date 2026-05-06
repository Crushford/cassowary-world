import { getCommits } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const branch = searchParams.get('branch') ?? 'main'
  const perPage = Math.min(100, parseInt(searchParams.get('per_page') ?? '100', 10))
  const commits = await getCommits(branch, perPage)
  return NextResponse.json(commits)
}
