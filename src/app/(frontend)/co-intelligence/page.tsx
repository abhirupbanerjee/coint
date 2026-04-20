import { db } from '@/lib/db'
import { coIntelligencePage } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Co-Intelligence',
  description: 'Understanding co-intelligence and its applications.',
}

export default async function CoIntelligencePage() {
  const [data] = await db.select().from(coIntelligencePage).limit(1)

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-8">Co-Intelligence</h1>
      <div className="prose prose-lg max-w-3xl">
        {data?.body ? (
          <div dangerouslySetInnerHTML={{ __html: data.body }} />
        ) : (
          <p className="text-foreground/70">Content not yet configured.</p>
        )}
      </div>
    </article>
  )
}
