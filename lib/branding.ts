import { db } from './db'
import { siteSettings, media, type Media } from './schema'
import { eq } from 'drizzle-orm'

export interface Branding {
  siteName: string
  logo: Media | null
  favicon: Media | null
}

const DEFAULT_SITE_NAME = 'Cointelligence'

export async function getBranding(): Promise<Branding> {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1)
    if (!settings) return { siteName: DEFAULT_SITE_NAME, logo: null, favicon: null }

    const ids = [settings.logoMediaId, settings.faviconMediaId].filter((v): v is number => typeof v === 'number')
    const mediaRows: Media[] = []
    for (const id of ids) {
      const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1)
      if (row) mediaRows.push(row)
    }
    const byId = new Map(mediaRows.map(m => [m.id, m]))

    return {
      siteName: settings.siteName || DEFAULT_SITE_NAME,
      logo: settings.logoMediaId ? byId.get(settings.logoMediaId) ?? null : null,
      favicon: settings.faviconMediaId ? byId.get(settings.faviconMediaId) ?? null : null,
    }
  } catch {
    return { siteName: DEFAULT_SITE_NAME, logo: null, favicon: null }
  }
}
