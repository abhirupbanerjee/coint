import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { desc } from 'drizzle-orm'
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
    const { title, theme, coverImageUrl, coverImageAlt, body: rawBody, excerpt, featured, publishedDate, status } = body

    if (!title || !theme) {
      return NextResponse.json({ error: 'Title and theme are required' }, { status: 400 })
    }

    const cleanBody = sanitize(rawBody || '')
    const slug = slugify(title)
    const readingTime = countReadingTime(cleanBody)

    const [article] = await db.insert(articles).values({
      title,
      slug,
      theme,
      coverImageUrl: coverImageUrl || null,
      coverImageAlt: coverImageAlt || null,
      body: cleanBody,
      excerpt: excerpt || '',
      readingTime,
      featured: featured || false,
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      status: status || 'draft',
    }).returning()

    return NextResponse.json(article, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
