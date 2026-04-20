import Link from 'next/link'
import type { Theme } from '@/lib/schema'

interface ThemesGridProps {
  themes: Theme[]
}

export default function ThemesGrid({ themes }: ThemesGridProps) {
  if (themes.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {themes.map(theme => (
        <Link
          key={theme.id}
          href={`/articles?theme=${encodeURIComponent(theme.slug)}`}
          className="group p-8 border border-border rounded-lg hover:border-primary hover:bg-muted transition-all"
        >
          <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
            {theme.name}
          </h3>
          <p className="text-foreground/60 text-sm mt-2">Explore articles in this theme</p>
        </Link>
      ))}
    </div>
  )
}
