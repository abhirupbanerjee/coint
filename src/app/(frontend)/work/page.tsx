import { db } from '@/lib/db'
import { workPage } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Work With Richard',
  description: 'Explore ways to work with Richard Ramdial.',
}

export default async function WorkPage() {
  const [data] = await db.select().from(workPage).limit(1)
  const engagements = data?.engagements ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-8">Work With Richard</h1>
      <div className="mb-12">
        <p className="text-lg text-foreground/80 leading-relaxed mb-8">
          {data?.introCopy || 'Learn about engagement options.'}
        </p>
      </div>
      <div className="space-y-8">
        {engagements.map((engagement, i) => (
          <div key={i} className="border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-serif font-bold mb-3">{engagement.title}</h2>
            <p className="text-foreground/70 leading-relaxed">{engagement.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
