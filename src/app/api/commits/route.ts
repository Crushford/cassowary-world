import { getCommits } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const branch = searchParams.get('branch') ?? 'main'
  const commits = await getCommits(branch)
  return NextResponse.json(commits)
}
