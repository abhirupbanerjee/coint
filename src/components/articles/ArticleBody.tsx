'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    twttr: { widgets: { load: (el?: HTMLElement) => void } }
  }
}

export default function ArticleBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const load = () => window.twttr?.widgets?.load(el)
    if (window.twttr) {
      load()
    } else {
      const s = document.createElement('script')
      s.src = 'https://platform.twitter.com/widgets.js'
      s.async = true
      s.onload = load
      document.head.appendChild(s)
    }
  }, [html])

  return (
    <div
      ref={ref}
      className="prose prose-lg max-w-2xl article-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
