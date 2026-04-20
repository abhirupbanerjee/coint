export const dynamic = 'force-dynamic'

import ArticleForm from '@/components/admin/ArticleForm'
import { db } from '@/lib/db'
import { themes } from '@/lib/schema'
import { asc } from 'drizzle-orm'
import { ensureThemesSeeded } from '@/lib/themes'
import Link from 'next/link'

export const metadata = { title: 'New Article' }

export default async function NewArticlePage() {
  await ensureThemesSeeded()
  const allThemes = await db.select().from(themes).orderBy(asc(themes.order), asc(themes.id))

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/articles" className="text-gray-400 hover:text-gray-600 text-sm">← Articles</Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900">New Article</h1>
      </div>
      <ArticleForm themes={allThemes} />
    </div>
  )
}
