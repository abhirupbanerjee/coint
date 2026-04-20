import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { articles, themes, articleSecondaryThemes } from '@/lib/schema'
import { desc, eq, inArray } from 'drizzle-orm'
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

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function countReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
  return Math.max(1, Math.ceil(words / 200))
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
  return session
}

async function validThemeIds(ids: number[]): Promise<Set<number>> {
  if (ids.length === 0) return new Set()
  const rows = await db.select({ id: themes.id }).from(themes).where(inArray(themes.id, ids))
  return new Set(rows.map(r => r.id))
}

export async function GET() {
  try {
    await requireAdmin()
    const all = await db.select().from(articles).orderBy(desc(articles.createdAt))
    return NextResponse.json(all)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
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

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    const primaryId = Number(primaryThemeId)
    if (!Number.isFinite(primaryId)) {
      return NextResponse.json({ error: 'A primary theme is required' }, { status: 400 })
    }

    const secondaryIds: number[] = Array.isArray(secondaryThemeIds)
      ? Array.from(new Set(secondaryThemeIds.map(Number).filter(Number.isFinite))).filter(id => id !== primaryId)
      : []

    const valid = await validThemeIds([primaryId, ...secondaryIds])
    if (!valid.has(primaryId)) return NextResponse.json({ error: 'Primary theme not found' }, { status: 400 })

    const [{ name: primaryName }] = await db
      .select({ name: themes.name })
      .from(themes)
      .where(eq(themes.id, primaryId))

    const cleanBody = sanitize(rawBody || '')
    const slug = slugify(title)
    const readingTime = countReadingTime(cleanBody)

    const [article] = await db.insert(articles).values({
      title,
      slug,
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
    }).returning()

    const validSecondary = secondaryIds.filter(id => valid.has(id))
    if (validSecondary.length > 0) {
      await db.insert(articleSecondaryThemes).values(
        validSecondary.map(themeId => ({ articleId: article.id, themeId }))
      )
    }

    return NextResponse.json(article, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
