# Cointelligence Admin User Manual

Last reviewed: April 20, 2026  
Admin URL: `/admin`

This manual is for Richard and covers the current admin dashboard behavior based on the latest code.

## 1. Access and Login

### How to sign in
1. Go to `/admin` or `/admin/login`.
2. Click `Continue with Google`.
3. Sign in with your approved Google account.

### Important
- Only emails in the `ADMIN_EMAILS` allowlist can access admin.
- If access is denied, you will see: `Access denied. Your Google account is not authorised.`

## 2. Admin Navigation

After login, the sidebar includes:
- `Articles`
- `Themes`
- `Media`
- `Home Page`
- `About`
- `Work`
- `Settings`
- `Submissions`

Utility links:
- `View Site`
- `Sign out`

## 3. Quick Publishing Workflow

Recommended order for new content:
1. Create or confirm Themes.
2. Upload images in Media Library.
3. Create article in Articles.
4. Set article to `Published`.
5. Optionally feature themes on Home Page.

## 4. Articles

Route: `/admin/articles`

### What you can do
- View all articles in a table.
- See title, theme, status, publish date, and likes.
- Open `Edit` for any article.
- Open `View` to check the live article page.
- Create a new article via `+ New Article`.

### Create/Edit article fields
- `Title` (required)
- `Primary theme` (required)
- `Secondary themes` (optional, multiple)
- `Status`: `Draft` or `Published`
- `Published Date`
- `Featured article` toggle
- `Cover Image` (pick from media library or paste URL)
- `Cover Image Alt Text`
- `Excerpt`
- `Article Body` (rich text editor)

### Rich text editor tools
- Bold, italic, underline
- H2/H3/H4
- Bullet and numbered lists
- Blockquote and horizontal rule
- Link insert
- Image URL insert
- YouTube URL embed
- Twitter/X URL embed placeholder

### Writing flow with TipTap + Media Library
1. Upload images first in `/admin/media`.
2. Copy the image URL (example: `/media/your-image-123456.png`).
3. Open `/admin/articles/new` (or edit an existing article).
4. Set the cover image:
   - Click `Browse media library` in the `Cover Image` field.
   - Select an image.
   - Add meaningful `Cover Image Alt Text` (for accessibility and SEO).
5. Add images inside article body:
   - In TipTap, place the cursor where the image should appear.
   - Click `Image`.
   - Paste the media URL copied from `/admin/media`.
6. Add embeds:
   - `YouTube`: click `YouTube` and paste the full video URL.
   - `Twitter/X`: click `Twitter/X` and paste the tweet URL.
7. Add links:
   - Highlight text, click `Link`, paste URL.
8. Finish with `Excerpt`, `Primary theme`, and `Status`.
9. Save as `Draft` first, preview from the Articles list, then change to `Published` when ready.

### TipTap practical guidance
- Keep headings consistent: use `H2` for main sections and `H3` for sub-sections.
- Keep paragraphs short for readability on mobile.
- Use bullet/numbered lists for frameworks, checklists, or steps.
- For external links, use descriptive anchor text (not just “click here”).
- If Twitter embeds do not render immediately in preview, save and reload the live article page.

### Notes and limits
- The URL slug is created automatically from title on first creation.
- Editing title later does not change the existing article URL slug.
- Draft articles are not shown on the public site.
- Deleting an article is permanent.

## 5. Themes

Route: `/admin/themes`

### What you can do
- Add a new theme.
- Rename a theme.
- Reorder themes with up/down arrows.
- Delete a theme.

### Important behavior
- Every article must have one primary theme.
- An article can also have multiple secondary themes.
- Theme slug is auto-generated and kept unique.
- You cannot delete a theme if any article uses it as the primary theme.
- Up to 4 themes can be featured on the home page.

## 6. Media Library

Route: `/admin/media`

### What you can do
- Upload images.
- See media grid preview.
- Copy media URL for reuse.
- Delete media.

### Notes
- Uploaded files are available under `/media/...`.
- Uploading from this page auto-fills alt text from filename.
- Article cover selection uses this library.
- Settings (logo/favicon) can also upload directly inside the picker modal.

## 7. Home Page Settings

Route: `/admin/home`

### What you can edit
- Hero section:
  - Heading
  - Subheading
  - Body text
  - Primary CTA label + URL
  - Secondary CTA label + URL
- Featured themes:
  - Select up to 4 themes
  - Reorder display sequence
- Co-Intelligence cards:
  - Add/remove cards
  - Card title + body

### Notes
- Featured themes display in the same order shown in admin.
- If no themes are selected, site falls back to default theme ordering.

### CTA guidance (important)
- `Primary CTA` is the main hero button (solid style). Use it for the highest-priority action.
- `Secondary CTA` is the supporting hero button (outlined style). Use it for a second-choice path.
- A button appears only when its URL is filled.
- If a URL is filled but the label is blank, the site uses default text:
  - Primary default label: `Get Started`
  - Secondary default label: `Learn More`

### CTA field best practices
- Label: 2-4 words, action-oriented.
- URL for internal pages: use relative paths like `/articles`, `/work`, `/connect`, `/about`.
- URL for external pages: use full links like `https://...`.
- Keep the two CTAs distinct so users are not asked to do the same thing twice.

### CTA examples Richard can use
1. Thought-leadership focus
   - Primary label: `Read Articles`
   - Primary URL: `/articles`
   - Secondary label: `Work With Richard`
   - Secondary URL: `/work`
2. Lead-generation focus
   - Primary label: `Book a Conversation`
   - Primary URL: `/connect`
   - Secondary label: `See My Approach`
   - Secondary URL: `/about`

## 8. About Page Settings

Route: `/admin/about`

### What you can edit
- First bio paragraph
- Second bio paragraph

Click `Save About Page` to publish changes.

## 9. Work Page Settings

Route: `/admin/work`

### What you can edit
- Intro copy
- Engagement types list:
  - Title
  - Description
  - Add/remove items

Click `Save Work Page` to publish changes.

## 10. Site Settings

Route: `/admin/settings`

### General settings
- Site name
- Tagline
- Contact email
- LinkedIn URL
- WhatsApp number (digits, no `+` or spaces recommended)

### Branding
- Site logo:
  - Choose from media library or upload in picker
  - If empty, text site name is shown in header
- Favicon:
  - Choose from media library or upload in picker
  - Shown in browser tabs/bookmarks

### Typography
- Heading font selector
- Body font selector
- Live preview before save

### Practical recommendations
- Logo: prefer transparent PNG or SVG, lightweight file size.
- Favicon: square image, ideally 512x512 source for best scaling.

## 11. Submissions Inbox

Route: `/admin/submissions`

### What appears here
- `Inquiry` messages from `/connect`
- `Feedback` messages from article pages

### What you can do
- View message details, sender, date, and article reference (if any).
- Mark each message read/unread.
- Use `Reply` button to open your email app with:
  - Recipient prefilled
  - Subject prefilled
  - Original message quoted

### Note
- `Reply` uses `mailto:` and depends on your device/browser email client setup.

## 12. What Changed Recently (Already in this manual)

The latest admin revisions include:
- Reply action in Submissions (`mailto` with quoted message).
- Settings support for selecting and uploading site logo and favicon.
- Cover image modal picker inside the article editor.
- Expanded typography controls (heading/body font picker + preview).
- Theme management improvements:
  - Primary + secondary theme model
  - Reordering
  - Home page featured themes selection/order

## 13. Troubleshooting

### Cannot log in
- Confirm your Google email is on the allowlist.
- Retry from `/admin/login`.

### Theme cannot be deleted
- Reassign articles that use it as primary theme, then delete.

### Media not showing on site
- Confirm file exists in Media Library.
- Re-select the image and save again.

### Favicon or logo did not update immediately
- Save settings again, then hard refresh the browser tab.

### Reply button does nothing
- Configure a default local email app for `mailto` links in your OS/browser.
