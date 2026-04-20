'use client'

import { useState, useTransition } from 'react'

interface FeedbackWidgetProps {
  articleSlug: string
}

export default function FeedbackWidget({ articleSlug }: FeedbackWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, type: 'feedback', articleSlug }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Could not submit feedback. Please try again.')
      }
    })
  }

  if (submitted) {
    return (
      <div className="p-4 bg-muted rounded-lg text-sm text-foreground/70">
        Thank you for your feedback!
      </div>
    )
  }

  const inputCls = 'w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background'

  return (
    <div>
      <h3 className="text-lg font-serif font-semibold mb-4">Leave feedback</h3>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" className={inputCls} />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className={inputCls} />
        <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} placeholder="Share your thoughts on this article…" className={inputCls} />
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Sending…' : 'Send Feedback'}
        </button>
      </form>
    </div>
  )
}
