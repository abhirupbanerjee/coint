import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { themes, articles } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { uniqueThemeSlug } from '@/lib/themes'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await req.json()
    const updates: Partial<{ name: string; slug: string; order: number; updatedAt: Date }> = { updatedAt: new Date() }

    if (typeof body.name === 'string') {
      const name = body.name.trim()
      if (!name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      updates.name = name
      updates.slug = await uniqueThemeSlug(name, id)
    }
    if (typeof body.order === 'number' && Number.isFinite(body.order)) {
      updates.order = body.order
    }

    const [row] = await db.update(themes).set(updates).where(eq(themes.id, id)).returning()
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(articles)
      .where(eq(articles.primaryThemeId, id))

    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${count} article${count === 1 ? ' uses' : 's use'} this as their primary theme. Reassign them first.` },
        { status: 409 }
      )
    }

    await db.delete(themes).where(eq(themes.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 })
  }
}
