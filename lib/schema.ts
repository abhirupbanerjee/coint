import { pgTable, serial, varchar, text, boolean, integer, timestamp, jsonb, primaryKey } from 'drizzle-orm/pg-core'

export const themes = pgTable('themes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  theme: varchar('theme', { length: 200 }),
  primaryThemeId: integer('primary_theme_id').references(() => themes.id),
  coverImageUrl: varchar('cover_image_url', { length: 1000 }),
  coverImageAlt: varchar('cover_image_alt', { length: 500 }),
  body: text('body').default(''),
  excerpt: text('excerpt').notNull().default(''),
  readingTime: integer('reading_time').default(5),
  featured: boolean('featured').default(false),
  publishedDate: timestamp('published_date').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  likes: integer('likes').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const articleSecondaryThemes = pgTable('article_secondary_themes', {
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  themeId: integer('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
}, (t) => ({ pk: primaryKey({ columns: [t.articleId, t.themeId] }) }))

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  siteName: varchar('site_name', { length: 200 }).default('Cointelligence'),
  tagline: text('tagline'),
  contactEmail: varchar('contact_email', { length: 300 }),
  linkedinUrl: varchar('linkedin_url', { length: 1000 }),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  headingFont: varchar('heading_font', { length: 100 }).default('Fraunces').notNull(),
  bodyFont: varchar('body_font', { length: 100 }).default('Inter').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const homePage = pgTable('home_page', {
  id: serial('id').primaryKey(),
  heroHeading: varchar('hero_heading', { length: 500 }),
  heroSubheading: varchar('hero_subheading', { length: 500 }),
  heroBody: text('hero_body'),
  primaryCtaLabel: varchar('primary_cta_label', { length: 200 }),
  primaryCtaUrl: varchar('primary_cta_url', { length: 1000 }),
  secondaryCtaLabel: varchar('secondary_cta_label', { length: 200 }),
  secondaryCtaUrl: varchar('secondary_cta_url', { length: 1000 }),
  featuredArticleIds: jsonb('featured_article_ids').$type<number[]>().default([]),
  featuredThemeIds: jsonb('featured_theme_ids').$type<number[]>().default([]).notNull(),
  coIntelligenceCards: jsonb('co_intelligence_cards').$type<{ title: string; body: string }[]>().default([]),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const aboutPage = pgTable('about_page', {
  id: serial('id').primaryKey(),
  bioParagraphOne: text('bio_paragraph_one'),
  bioParagraphTwo: text('bio_paragraph_two'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const workPage = pgTable('work_page', {
  id: serial('id').primaryKey(),
  introCopy: text('intro_copy'),
  engagements: jsonb('engagements').$type<{ title: string; description: string }[]>().default([]),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contactSubmissions = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 300 }).notNull(),
  email: varchar('email', { length: 300 }).notNull(),
  type: varchar('type', { length: 50 }).default('inquiry'),
  message: text('message').notNull(),
  articleSlug: varchar('article_slug', { length: 500 }),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 500 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  alt: varchar('alt', { length: 500 }),
  size: integer('size'),
  mimeType: varchar('mime_type', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type Theme = typeof themes.$inferSelect
export type NewTheme = typeof themes.$inferInsert
export type SiteSettings = typeof siteSettings.$inferSelect
export type HomePage = typeof homePage.$inferSelect
export type AboutPage = typeof aboutPage.$inferSelect
export type WorkPage = typeof workPage.$inferSelect
export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type Media = typeof media.$inferSelect
