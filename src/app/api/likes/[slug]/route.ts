import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [article] = await db.select({ likes: articles.likes }).from(articles).where(eq(articles.slug, slug))
  return NextResponse.json({ likes: article?.likes ?? 0 })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const cookieName = `liked_${slug}`
  const alreadyLiked = req.cookies.get(cookieName)?.value === '1'

  if (alreadyLiked) {
    const [article] = await db.select({ likes: articles.likes }).from(articles).where(eq(articles.slug, slug))
    return NextResponse.json({ likes: article?.likes ?? 0, alreadyLiked: true })
  }

  const [updated] = await db
    .update(articles)
    .set({ likes: sql`${articles.likes} + 1` })
    .where(eq(articles.slug, slug))
    .returning({ likes: articles.likes })

  const res = NextResponse.json({ likes: updated?.likes ?? 0 })
  res.cookies.set(cookieName, '1', { maxAge: 30 * 24 * 60 * 60, httpOnly: true, sameSite: 'lax' })
  return res
}
