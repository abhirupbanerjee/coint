import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { articles, themes, articleSecondaryThemes } from '@/lib/schema'
import { eq, inArray } from 'drizzle-orm'
import sanitizeHtml from 'sanitize-html'

function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 's']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'title'],
      'img': ['src', 'alt', 'width', 'height', 'class', 'style'],
      'a': ['href', 'target', 'rel', 'class'],
      '*': ['class', 'id', 'data-youtube-video', 'data-tweet-url'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
  })
}

function countReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
  return Math.max(1, Math.ceil(words / 200))
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
}

async function validThemeIds(ids: number[]): Promise<Set<number>> {
  if (ids.length === 0) return new Set()
  const rows = await db.select({ id: themes.id }).from(themes).where(inArray(themes.id, ids))
  return new Set(rows.map(r => r.id))
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const articleId = parseInt(id)
    const [article] = await db.select().from(articles).where(eq(articles.id, articleId))
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const secondary = await db
      .select({ themeId: articleSecondaryThemes.themeId })
      .from(articleSecondaryThemes)
      .where(eq(articleSecondaryThemes.articleId, articleId))
    return NextResponse.json({ ...article, secondaryThemeIds: secondary.map(s => s.themeId) })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const articleId = parseInt(id)
    const body = await req.json()
    const {
      title,
      primaryThemeId,
      secondaryThemeIds,
      coverImageUrl,
      coverImageAlt,
      body: rawBody,
      excerpt,
      featured,
      publishedDate,
      status,
    } = body

    const primaryId = Number(primaryThemeId)
    if (!Number.isFinite(primaryId)) {
      return NextResponse.json({ error: 'A primary theme is required' }, { status: 400 })
    }

    const secondaryIds: number[] = Array.isArray(secondaryThemeIds)
      ? Array.from(new Set(secondaryThemeIds.map(Number).filter(Number.isFinite))).filter(n => n !== primaryId)
      : []

    const valid = await validThemeIds([primaryId, ...secondaryIds])
    if (!valid.has(primaryId)) return NextResponse.json({ error: 'Primary theme not found' }, { status: 400 })

    const [{ name: primaryName }] = await db
      .select({ name: themes.name })
      .from(themes)
      .where(eq(themes.id, primaryId))

    const cleanBody = sanitize(rawBody || '')
    const readingTime = countReadingTime(cleanBody)

    const [updated] = await db.update(articles)
      .set({
        title,
        theme: primaryName,
        primaryThemeId: primaryId,
        coverImageUrl: coverImageUrl || null,
        coverImageAlt: coverImageAlt || null,
        body: cleanBody,
        excerpt: excerpt || '',
        readingTime,
        featured: featured || false,
        publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
        status: status || 'draft',
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.delete(articleSecondaryThemes).where(eq(articleSecondaryThemes.articleId, articleId))
    const validSecondary = secondaryIds.filter(n => valid.has(n))
    if (validSecondary.length > 0) {
      await db.insert(articleSecondaryThemes).values(
        validSecondary.map(themeId => ({ articleId, themeId }))
      )
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await db.delete(articles).where(eq(articles.id, parseInt(id)))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
