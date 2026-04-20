import Link from 'next/link'
import Image from 'next/image'
import type { Theme } from '@/lib/schema'
import type { ArticleWithThemes } from '@/lib/queries'

interface ArticlesByThemeProps {
  themes: Theme[]
  articles: ArticleWithThemes[]
}

export default function ArticlesByTheme({ themes, articles }: ArticlesByThemeProps) {
  if (themes.length === 0) return null

  const grouped = themes.map(theme => ({
    theme,
    articles: articles
      .filter(a =>
        a.primaryTheme?.id === theme.id ||
        a.secondaryThemes.some(s => s.id === theme.id)
      )
      .slice(0, 3),
  }))

  return (
    <div className="space-y-16">
      {grouped.map(group => (
        <div key={group.theme.id}>
          <h2 className="text-3xl font-serif font-bold mb-8">{group.theme.name}</h2>
          {group.articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {group.articles.map(article => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group overflow-hidden rounded-lg border border-border hover:border-primary transition-all"
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
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mt-2 line-clamp-2">{article.excerpt}</p>
                    <div className="flex justify-between items-center text-xs text-foreground/50 mt-3">
                      <span>{article.readingTime || 5} min</span>
                      <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-foreground/60 italic">No articles in this theme yet.</p>
          )}
        </div>
      ))}
    </div>
  )
}
