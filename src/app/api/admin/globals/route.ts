import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { siteSettings, homePage, aboutPage, workPage } from '@/lib/schema'
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, resolveFont } from '@/lib/googleFonts'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
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
      const toNullableInt = (v: unknown): number | null => {
        if (v === null || v === undefined || v === '') return null
        const n = Number(v)
        return Number.isFinite(n) && n > 0 ? n : null
      }
      const values = {
        siteName: body.siteName,
        tagline: body.tagline,
        contactEmail: body.contactEmail,
        linkedinUrl: body.linkedinUrl,
        whatsappNumber: body.whatsappNumber,
        headingFont: resolveFont(body.headingFont, DEFAULT_HEADING_FONT),
        bodyFont: resolveFont(body.bodyFont, DEFAULT_BODY_FONT),
        logoMediaId: toNullableInt(body.logoMediaId),
        faviconMediaId: toNullableInt(body.faviconMediaId),
      }
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
      const rawFeaturedThemes: unknown[] = Array.isArray(body.featuredThemeIds) ? body.featuredThemeIds : []
      const featuredThemeIds: number[] = Array.from(
        new Set(rawFeaturedThemes.map(v => Number(v)).filter(n => Number.isFinite(n)))
      ).slice(0, 4)
      const values = {
        heroHeading: body.heroHeading, heroSubheading: body.heroSubheading, heroBody: body.heroBody,
        primaryCtaLabel: body.primaryCtaLabel, primaryCtaUrl: body.primaryCtaUrl,
        secondaryCtaLabel: body.secondaryCtaLabel, secondaryCtaUrl: body.secondaryCtaUrl,
        featuredArticleIds: body.featuredArticleIds || [],
        featuredThemeIds,
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

    return NextResponse.json({ error: 'Unknown slug' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
