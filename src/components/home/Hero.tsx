import Link from 'next/link'

interface HeroProps {
  data?: {
    heroHeading?: string
    heroSubheading?: string
    heroBody?: string
    primaryCtaLabel?: string
    primaryCtaUrl?: string
    secondaryCtaLabel?: string
    secondaryCtaUrl?: string
  }
}

export default function Hero({ data }: HeroProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
      <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-6 text-foreground">
        {data?.heroHeading || 'Welcome to Cointelligence'}
      </h1>
      <p className="text-2xl sm:text-3xl font-serif text-foreground/80 mb-8">
        {data?.heroSubheading || 'Thought leadership, editorial thinking, ideas.'}
      </p>
      <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
        {data?.heroBody || 'Exploring leadership, systems, and thinking in the age of AI.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {data?.primaryCtaUrl && (
          <Link
            href={data.primaryCtaUrl}
            className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            {data.primaryCtaLabel || 'Get Started'}
          </Link>
        )}
        {data?.secondaryCtaUrl && (
          <Link
            href={data.secondaryCtaUrl}
            className="px-8 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors"
          >
            {data.secondaryCtaLabel || 'Learn More'}
          </Link>
        )}
      </div>
    </section>
  )
}
