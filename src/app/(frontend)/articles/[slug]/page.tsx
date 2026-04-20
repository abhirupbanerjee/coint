import { db } from '@/lib/db'
import { articles, siteSettings } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import ShareButtons from '@/components/articles/ShareButtons'
import LikeButton from '@/components/articles/LikeButton'
import FeedbackWidget from '@/components/articles/FeedbackWidget'

export const dynamic = 'force-dynamic'

async function getArticle(slug: string) {
  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
  return article ?? null
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cointelligence.com'
  const url = `${SITE_URL}/articles/${article.slug}`
  const coverUrl = article.coverImageUrl ? `${SITE_URL}${article.coverImageUrl}` : `${SITE_URL}/og-default.png`

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: 'article',
      siteName: 'Cointelligence',
      publishedTime: article.publishedDate.toISOString(),
      authors: ['Richard Ramdial'],
      images: [{ url: coverUrl, width: 1400, height: 900, alt: article.title }],
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.excerpt, images: [coverUrl] },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cointelligence.com'

  const [article, settings] = await Promise.all([
    getArticle(slug),
    db.select().from(siteSettings).limit(1).then(rows => rows[0] ?? null),
  ])

  if (!article) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedDate.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { '@type': 'Person', name: 'Richard Ramdial', url: `${SITE_URL}/about` },
    publisher: { '@type': 'Organization', name: 'Cointelligence', url: SITE_URL },
    image: article.coverImageUrl ? `${SITE_URL}${article.coverImageUrl}` : `${SITE_URL}/og-default.png`,
    url: `${SITE_URL}/articles/${article.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/articles/${article.slug}` },
  }

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cover Image */}
      {article.coverImageUrl ? (
        <div className="mb-12 aspect-video relative rounded-lg overflow-hidden">
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt ?? article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      ) : (
        <div className="mb-12 aspect-video bg-muted rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
        </div>
      )}

      {/* Header */}
      <header className="mb-12">
        <div className="mb-4">
          <p className="text-sm font-medium text-primary mb-2">{article.theme}</p>
          <p className="text-sm text-foreground/60">
            {new Date(article.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}{article.readingTime || 5} min read
          </p>
        </div>
        <h1 className="text-5xl font-serif font-bold leading-tight mb-6">{article.title}</h1>
        <p className="text-xl text-foreground/70 mb-6">{article.excerpt}</p>
        <ShareButtons
          title={article.title}
          excerpt={article.excerpt}
          slug={article.slug}
          whatsappNumber={settings?.whatsappNumber ?? undefined}
        />
      </header>

      {/* Body */}
      <div
        className="prose prose-lg max-w-2xl article-body"
        dangerouslySetInnerHTML={{ __html: article.body || '' }}
      />

      {/* Like + Feedback */}
      <div className="mt-12 pt-8 border-t border-border space-y-8">
        <LikeButton slug={article.slug} initialLikes={article.likes} />
        <FeedbackWidget articleSlug={article.slug} />
      </div>
    </article>
  )
}
