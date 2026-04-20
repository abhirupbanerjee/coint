import { db } from './db'
import { themes, articles, homePage } from './schema'
import { eq, isNull, sql } from 'drizzle-orm'

export const DEFAULT_THEME_NAMES = [
  'Leadership and Perception',
  'Systems and Transformation',
  'Thinking in the Age of AI',
  'The Craft of Leadership',
] as const

export function slugifyThemeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Idempotent: on first call seeds the four default themes, backfills
 * articles.primaryThemeId from the legacy articles.theme string, and
 * fills home_page.featuredThemeIds if empty. Safe to call repeatedly.
 */
export async function ensureThemesSeeded(): Promise<void> {
  const existing = await db.select({ id: themes.id }).from(themes).limit(1)
  if (existing.length === 0) {
    await db.insert(themes).values(
      DEFAULT_THEME_NAMES.map((name, i) => ({
        name,
        slug: slugifyThemeName(name),
        order: i,
      }))
    )
  }

  const allThemes = await db.select().from(themes)
  const byName = new Map(allThemes.map(t => [t.name, t.id]))

  const articlesNeedingBackfill = await db
    .select({ id: articles.id, theme: articles.theme })
    .from(articles)
    .where(isNull(articles.primaryThemeId))

  for (const a of articlesNeedingBackfill) {
    const themeId = a.theme ? byName.get(a.theme) : null
    if (themeId) {
      await db.update(articles).set({ primaryThemeId: themeId }).where(eq(articles.id, a.id))
    }
  }

  const [home] = await db.select().from(homePage).limit(1)
  if (home && (!home.featuredThemeIds || home.featuredThemeIds.length === 0)) {
    await db
      .update(homePage)
      .set({ featuredThemeIds: allThemes.slice(0, 4).map(t => t.id), updatedAt: new Date() })
      .where(eq(homePage.id, home.id))
  }
}

/** Slug collisions: append "-2", "-3", ... until unique. */
export async function uniqueThemeSlug(base: string, excludeId?: number): Promise<string> {
  const baseSlug = slugifyThemeName(base) || 'theme'
  let candidate = baseSlug
  let n = 2
  while (true) {
    const rows = await db
      .select({ id: themes.id })
      .from(themes)
      .where(sql`${themes.slug} = ${candidate}`)
    const conflict = rows.find(r => r.id !== excludeId)
    if (!conflict) return candidate
    candidate = `${baseSlug}-${n++}`
  }
}
