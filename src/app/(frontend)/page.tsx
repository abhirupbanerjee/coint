import { getPayload } from 'payload'
import config from '@/payload.config'
import Hero from '@/components/home/Hero'

export const dynamic = 'force-dynamic'
import ThemesGrid from '@/components/home/ThemesGrid'
import FeaturedArticles from '@/components/home/FeaturedArticles'
import CoIntelligenceCards from '@/components/home/CoIntelligenceCards'
import ArticlesByTheme from '@/components/home/ArticlesByTheme'

export const metadata = {
  title: {
    absolute: 'Cointelligence',
  },
  description: 'Editorial and thought-leadership platform by Richard Ramdial',
}

export default async function HomePage() {
  let homePage = null
  try {
    const payload = await getPayload({ config })
    homePage = await payload.findGlobal({ slug: 'home-page' })
  } catch (err) {
    console.error('Failed to fetch home page data:', err)
  }

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <Hero data={homePage} />

      {/* Themes Grid */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ThemesGrid />
      </section>

      {/* Featured Articles */}
      {homePage?.featuredArticles && homePage.featuredArticles.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-8">Featured Articles</h2>
          <FeaturedArticles articles={homePage.featuredArticles} />
        </section>
      )}

      {/* Co-Intelligence Cards */}
      {homePage?.coIntelligenceCards && homePage.coIntelligenceCards.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-8">Co-Intelligence</h2>
          <CoIntelligenceCards cards={homePage.coIntelligenceCards} />
        </section>
      )}

      {/* Articles by Theme */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ArticlesByTheme />
      </section>
    </div>
  )
}
