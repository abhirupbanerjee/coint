import ArticlesExplorer, { type ExplorerArticle } from '@/components/articles/ArticlesExplorer'
import { getAllThemes, getPublishedArticlesWithThemes } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Articles',
  description: 'Read articles on leadership, systems, thinking, and more.',
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>
}) {
  const { theme: themeSlug } = await searchParams
  const [allThemes, articles] = await Promise.all([
    getAllThemes(),
    getPublishedArticlesWithThemes(),
  ])

  const explorerArticles: ExplorerArticle[] = articles.map(a => {
    const themeNames = [
      a.primaryTheme?.name ?? '',
      ...a.secondaryThemes.map(s => s.name),
    ].join(' ')
    const bodyText = stripHtml(a.body ?? '')
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      coverImageUrl: a.coverImageUrl,
      coverImageAlt: a.coverImageAlt,
      readingTime: a.readingTime,
      publishedDate: a.publishedDate.toISOString(),
      primaryTheme: a.primaryTheme ? { id: a.primaryTheme.id, name: a.primaryTheme.name, slug: a.primaryTheme.slug } : null,
      secondaryThemes: a.secondaryThemes.map(s => ({ id: s.id, name: s.name, slug: s.slug })),
      searchText: `${a.title} ${a.excerpt} ${themeNames} ${bodyText}`.toLowerCase(),
    }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-4">Articles</h1>
      <p className="text-lg text-foreground/70 mb-12">Exploring leadership, systems, and thinking.</p>

      <ArticlesExplorer
        articles={explorerArticles}
        themes={allThemes}
        initialThemeSlug={themeSlug}
      />
    </div>
  )
}
