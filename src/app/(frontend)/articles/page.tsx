import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Articles',
  description: 'Read articles on leadership, systems, thinking, and more.',
}

const THEMES = [
  'Leadership and Perception',
  'Systems and Transformation',
  'Thinking in the Age of AI',
  'The Craft of Leadership',
]

export default async function ArticlesPage() {
  const all = await db
    .select()
    .from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedDate))

  const articlesByTheme = THEMES.map(t => ({
    theme: t,
    articles: all.filter(a => a.theme === t),
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-4">Articles</h1>
      <p className="text-lg text-foreground/70 mb-12">Exploring leadership, systems, and thinking.</p>

      {/* Theme Navigation */}
      <div className="mb-12 pb-6 border-b border-border overflow-x-auto">
        <div className="flex gap-4">
          <Link href="/articles" className="whitespace-nowrap px-4 py-2 font-medium text-foreground/70 hover:text-foreground transition-colors">
            All
          </Link>
          {THEMES.map(t => (
            <Link
              key={t}
              href={`/articles?theme=${encodeURIComponent(t)}`}
              className="whitespace-nowrap px-4 py-2 font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {t.split(' ')[0]}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-16">
        {articlesByTheme.map(group => (
          <div key={group.theme}>
            <h2 className="text-3xl font-serif font-bold mb-8">{group.theme}</h2>
            {group.articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {group.articles.map(article => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group overflow-hidden rounded-lg border border-border hover:border-primary transition-all hover:shadow-md"
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
                    <div className="p-6">
                      <h3 className="font-serif font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors mb-3">
                        {article.title}
                      </h3>
                      <p className="text-foreground/60 line-clamp-3 mb-4">{article.excerpt}</p>
                      <div className="flex justify-between items-center text-xs text-foreground/50">
                        <span>{article.readingTime || 5} min read</span>
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
    </div>
  )
}
