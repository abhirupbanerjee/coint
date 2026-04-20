import { db } from '@/lib/db'
import { homePage, articles } from '@/lib/schema'
import { eq, inArray, desc } from 'drizzle-orm'
import Hero from '@/components/home/Hero'
import ThemesGrid from '@/components/home/ThemesGrid'
import FeaturedArticles from '@/components/home/FeaturedArticles'
import CoIntelligenceCards from '@/components/home/CoIntelligenceCards'
import ArticlesByTheme from '@/components/home/ArticlesByTheme'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: { absolute: 'Cointelligence' },
  description: 'Editorial and thought-leadership platform by Richard Ramdial',
}

export default async function HomePage() {
  const [homePageData] = await db.select().from(homePage).limit(1)

  const featuredIds: number[] = homePageData?.featuredArticleIds ?? []
  const featuredArticles =
    featuredIds.length > 0
      ? await db.select().from(articles).where(inArray(articles.id, featuredIds))
      : []

  const allArticles = await db
    .select()
    .from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedDate))

  return (
    <div className="space-y-20 py-12">
      <Hero data={homePageData ? {
        heroHeading: homePageData.heroHeading ?? undefined,
        heroSubheading: homePageData.heroSubheading ?? undefined,
        heroBody: homePageData.heroBody ?? undefined,
        primaryCtaLabel: homePageData.primaryCtaLabel ?? undefined,
        primaryCtaUrl: homePageData.primaryCtaUrl ?? undefined,
        secondaryCtaLabel: homePageData.secondaryCtaLabel ?? undefined,
        secondaryCtaUrl: homePageData.secondaryCtaUrl ?? undefined,
      } : undefined} />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ThemesGrid />
      </section>

      {featuredArticles.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-8">Featured Articles</h2>
          <FeaturedArticles articles={featuredArticles} />
        </section>
      )}

      {homePageData?.coIntelligenceCards && homePageData.coIntelligenceCards.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-8">Co-Intelligence</h2>
          <CoIntelligenceCards cards={homePageData.coIntelligenceCards} />
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ArticlesByTheme articles={allArticles} />
      </section>
    </div>
  )
}
