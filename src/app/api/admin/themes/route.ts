import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { themes } from '@/lib/schema'
import { asc } from 'drizzle-orm'
import { ensureThemesSeeded, uniqueThemeSlug } from '@/lib/themes'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
}

export async function GET() {
  try {
    await requireAdmin()
    await ensureThemesSeeded()
    const all = await db.select().from(themes).orderBy(asc(themes.order), asc(themes.id))
    return NextResponse.json(all)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = await uniqueThemeSlug(name)
    const existing = await db.select({ id: themes.id }).from(themes)
    const nextOrder = existing.length

    const [row] = await db.insert(themes).values({ name, slug, order: nextOrder }).returning()
    return NextResponse.json(row, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 })
  }
}
