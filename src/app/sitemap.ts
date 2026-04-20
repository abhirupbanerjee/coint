import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cointelligence.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await db
    .select({ slug: articles.slug, updatedAt: articles.updatedAt, publishedDate: articles.publishedDate })
    .from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedDate))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/articles`,        changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/about`,           changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/work`,            changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/connect`,         changeFrequency: 'yearly',  priority: 0.6 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = published.map(article => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...articleRoutes]
}
