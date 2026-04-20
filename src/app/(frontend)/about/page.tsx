import { db } from '@/lib/db'
import { aboutPage } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'About Richard',
  description: 'Learn more about Richard Ramdial.',
}

export default async function AboutPage() {
  const [data] = await db.select().from(aboutPage).limit(1)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-8">About Richard</h1>
      <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
        <p>{data?.bioParagraphOne || 'Bio not yet configured.'}</p>
        {data?.bioParagraphTwo && <p>{data.bioParagraphTwo}</p>}
      </div>
    </div>
  )
}
