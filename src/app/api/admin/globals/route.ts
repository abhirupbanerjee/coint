import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { siteSettings, homePage, aboutPage, workPage, coIntelligencePage } from '@/lib/schema'
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

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
}

async function upsert<T extends { id: number }>(
  table: Parameters<typeof db.select>[0] extends never ? never : any,
  values: Record<string, unknown>
) {
  const existing = await db.select().from(table).limit(1)
  if (existing.length > 0) {
    const [row] = await db.update(table).set({ ...values, updatedAt: new Date() }).returning()
    return row
  } else {
    const [row] = await db.insert(table).values({ ...values }).returning()
    return row
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableMap: Record<string, any> = {
      'site-settings': siteSettings,
      'home-page': homePage,
      'about-page': aboutPage,
      'work-page': workPage,
      'co-intelligence-page': coIntelligencePage,
    }

    const table = slug ? tableMap[slug] : null
    if (!table) return NextResponse.json({ error: 'Unknown slug' }, { status: 400 })

    const [row] = await db.select().from(table).limit(1)
    return NextResponse.json(row || {})
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const body = await req.json()

    if (slug === 'site-settings') {
      const existing = await db.select().from(siteSettings).limit(1)
      const values = { siteName: body.siteName, tagline: body.tagline, contactEmail: body.contactEmail, linkedinUrl: body.linkedinUrl, whatsappNumber: body.whatsappNumber }
      let row
      if (existing.length > 0) {
        ;[row] = await db.update(siteSettings).set({ ...values, updatedAt: new Date() }).returning()
      } else {
        ;[row] = await db.insert(siteSettings).values(values).returning()
      }
      return NextResponse.json(row)
    }

    if (slug === 'home-page') {
      const existing = await db.select().from(homePage).limit(1)
      const values = {
        heroHeading: body.heroHeading, heroSubheading: body.heroSubheading, heroBody: body.heroBody,
        primaryCtaLabel: body.primaryCtaLabel, primaryCtaUrl: body.primaryCtaUrl,
        secondaryCtaLabel: body.secondaryCtaLabel, secondaryCtaUrl: body.secondaryCtaUrl,
        featuredArticleIds: body.featuredArticleIds || [],
        coIntelligenceCards: body.coIntelligenceCards || [],
      }
      let row
      if (existing.length > 0) {
        ;[row] = await db.update(homePage).set({ ...values, updatedAt: new Date() }).returning()
      } else {
        ;[row] = await db.insert(homePage).values(values).returning()
      }
      return NextResponse.json(row)
    }

    if (slug === 'about-page') {
      const existing = await db.select().from(aboutPage).limit(1)
      const values = { bioParagraphOne: body.bioParagraphOne, bioParagraphTwo: body.bioParagraphTwo }
      let row
      if (existing.length > 0) {
        ;[row] = await db.update(aboutPage).set({ ...values, updatedAt: new Date() }).returning()
      } else {
        ;[row] = await db.insert(aboutPage).values(values).returning()
      }
      return NextResponse.json(row)
    }

    if (slug === 'work-page') {
      const existing = await db.select().from(workPage).limit(1)
      const values = { introCopy: body.introCopy, engagements: body.engagements || [] }
      let row
      if (existing.length > 0) {
        ;[row] = await db.update(workPage).set({ ...values, updatedAt: new Date() }).returning()
      } else {
        ;[row] = await db.insert(workPage).values(values).returning()
      }
      return NextResponse.json(row)
    }

    if (slug === 'co-intelligence-page') {
      const existing = await db.select().from(coIntelligencePage).limit(1)
      const cleanBody = sanitize(body.body || '')
      const values = { body: cleanBody }
      let row
      if (existing.length > 0) {
        ;[row] = await db.update(coIntelligencePage).set({ ...values, updatedAt: new Date() }).returning()
      } else {
        ;[row] = await db.insert(coIntelligencePage).values(values).returning()
      }
      return NextResponse.json(row)
    }

    return NextResponse.json({ error: 'Unknown slug' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
