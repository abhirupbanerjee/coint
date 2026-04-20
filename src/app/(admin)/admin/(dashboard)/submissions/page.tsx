'use client'

import { useEffect, useState, useTransition } from 'react'
import type { ContactSubmission } from '@/lib/schema'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetch('/api/admin/submissions').then(r => r.json()).then(setSubmissions)
  }, [])

  const toggleRead = (id: number, read: boolean) => {
    startTransition(async () => {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read }),
      })
      const updated = await res.json()
      setSubmissions(s => s.map(sub => sub.id === id ? updated : sub))
    })
  }

  const unreadCount = submissions.filter(s => !s.read).length

  const buildReplyHref = (sub: ContactSubmission) => {
    const label = sub.type === 'feedback' ? 'Feedback' : 'Inquiry'
    const slugRef = sub.articleSlug ? ` (re: ${sub.articleSlug})` : ''
    const subject = `Re: ${label}${slugRef}`
    const sent = new Date(sub.createdAt).toLocaleString()
    const quoted = sub.message.split('\n').map(l => `> ${l}`).join('\n')
    const body = `\n\n\nOn ${sent}, ${sub.name} <${sub.email}> wrote:\n${quoted}\n`
    return `mailto:${encodeURIComponent(sub.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Submissions</h1>
        {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">{unreadCount} unread</span>}
      </div>
      {submissions.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub.id} className={`bg-white rounded-xl border p-5 ${!sub.read ? 'border-gray-400' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-medium text-gray-900">{sub.name}</span>
                  <span className="text-gray-500 text-sm ml-2">{sub.email}</span>
                  <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sub.type === 'feedback' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{sub.type}</span>
                  {sub.articleSlug && <span className="ml-2 text-xs text-gray-400">re: {sub.articleSlug}</span>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">{new Date(sub.createdAt).toLocaleDateString()}</span>
                  <a
                    href={buildReplyHref(sub)}
                    className="text-xs px-3 py-1 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    title={`Reply to ${sub.email}`}
                  >
                    Reply
                  </a>
                  <button onClick={() => toggleRead(sub.id, !sub.read)} disabled={isPending} className={`text-xs px-3 py-1 rounded-lg border transition-colors ${sub.read ? 'border-gray-200 text-gray-400 hover:border-gray-400' : 'border-gray-800 bg-gray-800 text-white hover:bg-gray-700'}`}>
                    {sub.read ? 'Mark unread' : 'Mark read'}
                  </button>
                </div>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{sub.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
