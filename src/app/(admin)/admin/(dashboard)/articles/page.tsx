export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { articles, themes } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'

export const metadata = { title: 'Articles' }

export default async function AdminArticlesPage() {
  const all = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      themeName: themes.name,
      status: articles.status,
      publishedDate: articles.publishedDate,
      likes: articles.likes,
    })
    .from(articles)
    .leftJoin(themes, eq(themes.id, articles.primaryThemeId))
    .orderBy(desc(articles.createdAt))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Articles</h1>
        <Link href="/admin/articles/new" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
          + New Article
        </Link>
      </div>

      {all.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-4">No articles yet.</p>
          <Link href="/admin/articles/new" className="text-gray-900 underline">Create your first article</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Theme</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">♥</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {all.map(article => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{article.title}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs max-w-[140px] truncate">{article.themeName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">
                    {article.publishedDate ? new Date(article.publishedDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{article.likes}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/articles/${article.id}`} className="text-gray-900 text-xs font-medium hover:underline">Edit</Link>
                      <Link href={`/articles/${article.slug}`} target="_blank" className="text-gray-400 text-xs hover:underline">View</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
