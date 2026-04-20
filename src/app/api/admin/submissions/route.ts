import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { contactSubmissions } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
}

export async function GET() {
  try {
    await requireAdmin()
    const all = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt))
    return NextResponse.json(all)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin()
    const { id, read } = await req.json()
    const [updated] = await db.update(contactSubmissions)
      .set({ read })
      .where(eq(contactSubmissions.id, id))
      .returning()
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
