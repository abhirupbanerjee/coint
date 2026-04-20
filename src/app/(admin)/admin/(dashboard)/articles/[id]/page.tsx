export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { articles, media } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import ArticleForm from '@/components/admin/ArticleForm'
import Link from 'next/link'

export const metadata = { title: 'Edit Article' }

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [article] = await db.select().from(articles).where(eq(articles.id, parseInt(id)))
  if (!article) notFound()

  const mediaItems = await db.select({ url: media.url, filename: media.filename, alt: media.alt }).from(media).orderBy(desc(media.createdAt))

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/articles" className="text-gray-400 hover:text-gray-600 text-sm">← Articles</Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900 truncate max-w-lg">{article.title}</h1>
        <Link href={`/articles/${article.slug}`} target="_blank" className="ml-auto text-xs text-gray-400 hover:text-gray-600">View →</Link>
      </div>
      <ArticleForm article={article} mediaItems={mediaItems} />
    </div>
  )
}
