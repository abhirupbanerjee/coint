export const dynamic = 'force-dynamic'

import ArticleForm from '@/components/admin/ArticleForm'
import { db } from '@/lib/db'
import { media } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'

export const metadata = { title: 'New Article' }

export default async function NewArticlePage() {
  const mediaItems = await db.select({ url: media.url, filename: media.filename, alt: media.alt }).from(media).orderBy(desc(media.createdAt))

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/articles" className="text-gray-400 hover:text-gray-600 text-sm">← Articles</Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900">New Article</h1>
      </div>
      <ArticleForm mediaItems={mediaItems} />
    </div>
  )
}
