import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'

const THEMES = [
  'Leadership and Perception',
  'Systems and Transformation',
  'Thinking in the Age of AI',
  'The Craft of Leadership',
]

export default async function ArticlesByTheme() {
  let articles = { docs: [] as any[] }
  try {
    const payload = await getPayload({ config })
    articles = await payload.find({
      collection: 'articles',
      where: { '_status': { equals: 'published' } },
    })
  } catch (err) {
    console.error('Failed to fetch articles:', err)
  }

  // Group by theme
  const articlesByTheme = THEMES.map(theme => ({
    theme,
    articles: articles.docs.filter(a => a.theme === theme).slice(0, 3),
  }))

  return (
    <div className="space-y-16">
      {articlesByTheme.map(group => (
        <div key={group.theme}>
          <h2 className="text-3xl font-serif font-bold mb-8">{group.theme}</h2>
          {group.articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {group.articles.map(article => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group overflow-hidden rounded-lg border border-border hover:border-primary transition-all"
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {typeof article.coverImage === 'object' && article.coverImage.url ? (
                      <Image
                        src={article.coverImage.url}
                        alt={article.coverImage.alt ?? article.title}
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
