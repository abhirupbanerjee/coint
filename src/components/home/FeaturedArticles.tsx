import Link from 'next/link'
import Image from 'next/image'
import type { ArticleWithThemes } from '@/lib/queries'

interface FeaturedArticlesProps {
  articles: ArticleWithThemes[]
}

export default function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map(article => (
        <Link
          key={article.id}
          href={`/articles/${article.slug}`}
          className="group overflow-hidden rounded-lg border border-border hover:border-primary transition-all hover:shadow-lg"
        >
          <div className="aspect-video bg-muted relative overflow-hidden">
            {article.coverImageUrl ? (
              <Image
                src={article.coverImageUrl}
                alt={article.coverImageAlt ?? article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-foreground/40">No image</span>
              </div>
            )}
          </div>
          <div className="p-6">
            {article.primaryTheme && (
              <p className="text-sm font-medium text-primary mb-2">{article.primaryTheme.name}</p>
            )}
            <h3 className="text-lg font-serif font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-foreground/60 line-clamp-2 mb-4">{article.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-foreground/50">
              <span>{article.readingTime || 5} min read</span>
              <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
