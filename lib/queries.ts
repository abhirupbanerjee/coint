import { db } from './db'
import { articles, themes, articleSecondaryThemes, homePage } from './schema'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import type { Article, Theme } from './schema'

export type ArticleWithThemes = Article & {
  primaryTheme: Theme | null
  secondaryThemes: Theme[]
}

async function attachThemes(rows: Article[]): Promise<ArticleWithThemes[]> {
  if (rows.length === 0) return []

  const primaryIds = Array.from(new Set(rows.map(r => r.primaryThemeId).filter((x): x is number => typeof x === 'number')))
  const articleIds = rows.map(r => r.id)

  const [primaryRows, linkRows] = await Promise.all([
    primaryIds.length > 0
      ? db.select().from(themes).where(inArray(themes.id, primaryIds))
      : Promise.resolve([] as Theme[]),
    db
      .select({ articleId: articleSecondaryThemes.articleId, theme: themes })
      .from(articleSecondaryThemes)
      .innerJoin(themes, eq(themes.id, articleSecondaryThemes.themeId))
      .where(inArray(articleSecondaryThemes.articleId, articleIds)),
  ])

  const primaryById = new Map(primaryRows.map(t => [t.id, t]))
  const secondaryByArticle = new Map<number, Theme[]>()
  for (const link of linkRows) {
    const list = secondaryByArticle.get(link.articleId) ?? []
    list.push(link.theme)
    secondaryByArticle.set(link.articleId, list)
  }

  return rows.map(r => ({
    ...r,
    primaryTheme: r.primaryThemeId ? primaryById.get(r.primaryThemeId) ?? null : null,
    secondaryThemes: secondaryByArticle.get(r.id) ?? [],
  }))
}

export async function getPublishedArticlesWithThemes(): Promise<ArticleWithThemes[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedDate))
  return attachThemes(rows)
}

export async function getArticleBySlugWithThemes(slug: string): Promise<ArticleWithThemes | null> {
  const [row] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
  if (!row) return null
  const [withThemes] = await attachThemes([row])
  return withThemes
}

export async function getFeaturedHomeThemes(): Promise<Theme[]> {
  const [home] = await db.select().from(homePage).limit(1)
  const ids = home?.featuredThemeIds ?? []
  if (!Array.isArray(ids) || ids.length === 0) {
    return db.select().from(themes).orderBy(asc(themes.order), asc(themes.id)).limit(4)
  }
  const rows = await db.select().from(themes).where(inArray(themes.id, ids as number[]))
  const byId = new Map(rows.map(t => [t.id, t]))
  return (ids as number[]).map(id => byId.get(id)).filter((t): t is Theme => Boolean(t))
}

export async function getAllThemes(): Promise<Theme[]> {
  return db.select().from(themes).orderBy(asc(themes.order), asc(themes.id))
}
