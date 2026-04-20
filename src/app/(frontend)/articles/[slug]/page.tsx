import { db } from '@/lib/db'
import { siteSettings } from '@/lib/schema'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ShareButtons from '@/components/articles/ShareButtons'
import LikeButton from '@/components/articles/LikeButton'
import FeedbackWidget from '@/components/articles/FeedbackWidget'
import ArticleBody from '@/components/articles/ArticleBody'
import { getArticleBySlugWithThemes } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlugWithThemes(slug)
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
    getArticleBySlugWithThemes(slug),
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
          {article.primaryTheme && (
            <p className="text-sm font-medium text-primary mb-2">{article.primaryTheme.name}</p>
          )}
          <p className="text-sm text-foreground/60">
            {new Date(article.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}{article.readingTime || 5} min read
          </p>
        </div>
        <h1 className="text-5xl font-serif font-bold leading-tight mb-6">{article.title}</h1>
        <p className="text-xl text-foreground/70 mb-6">{article.excerpt}</p>
        {article.secondaryThemes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.secondaryThemes.map(t => (
              <Link
                key={t.id}
                href={`/articles?theme=${encodeURIComponent(t.slug)}`}
                className="px-3 py-1 text-xs rounded-full bg-muted text-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        )}
        <ShareButtons
          title={article.title}
          excerpt={article.excerpt}
          slug={article.slug}
          whatsappNumber={settings?.whatsappNumber ?? undefined}
        />
      </header>

      {/* Body */}
      <ArticleBody html={(article.body || '').replace(
        /<div class="twitter-embed" data-tweet-url="([^"]+)"[^>]*><\/div>/g,
        '<blockquote class="twitter-tweet"><a href="$1">View tweet</a></blockquote>'
      )} />

      {/* Like + Feedback */}
      <div className="mt-12 pt-8 border-t border-border space-y-8">
        <LikeButton slug={article.slug} initialLikes={article.likes} />
        <FeedbackWidget articleSlug={article.slug} />
      </div>
    </article>
  )
}
