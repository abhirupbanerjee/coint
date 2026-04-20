'use client'

import { useState, useTransition } from 'react'

interface InquiryFormProps {
  contactEmail?: string
}

export default function InquiryForm({ contactEmail: _contactEmail }: InquiryFormProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, type: 'inquiry' }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Could not send your message. Please try again.')
      }
    })
  }

  if (submitted) {
    return (
      <div className="p-6 bg-muted rounded-lg max-w-lg">
        <p className="font-medium text-foreground mb-1">Message received!</p>
        <p className="text-sm text-foreground/70">Thank you for reaching out. Richard will be in touch soon.</p>
      </div>
    )
  }

  const inputCls = 'w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Name</label>
        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={inputCls} placeholder="Your name" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} placeholder="your@email.com" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Message</label>
        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={6} className={inputCls + ' resize-none'} placeholder="Your message…" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Sending…' : 'Send Inquiry'}
      </button>
    </form>
  )
}
