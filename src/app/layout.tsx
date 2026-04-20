import type { Metadata } from "next";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/schema";
import {
  DEFAULT_BODY_FONT,
  DEFAULT_HEADING_FONT,
  fontStack,
  googleFontsHref,
  resolveFont,
} from "@/lib/googleFonts";
import { getBranding } from "@/lib/branding";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, favicon } = await getBranding();
  const title = siteName || 'Cointelligence';
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cointelligence.com'),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description: 'Editorial and thought-leadership platform by Richard Ramdial',
    icons: favicon
      ? {
          icon: [{ url: favicon.url, type: favicon.mimeType || undefined }],
          shortcut: [favicon.url],
          apple: [favicon.url],
        }
      : undefined,
    openGraph: {
      siteName: title,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

async function getFontSettings() {
  try {
    const [row] = await db
      .select({ headingFont: siteSettings.headingFont, bodyFont: siteSettings.bodyFont })
      .from(siteSettings)
      .limit(1);
    return {
      headingFont: resolveFont(row?.headingFont, DEFAULT_HEADING_FONT),
      bodyFont: resolveFont(row?.bodyFont, DEFAULT_BODY_FONT),
    };
  } catch {
    return { headingFont: DEFAULT_HEADING_FONT, bodyFont: DEFAULT_BODY_FONT };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { headingFont, bodyFont } = await getFontSettings();
  const fontsHref = googleFontsHref([headingFont, bodyFont]);
  const cssVars = {
    ['--font-heading' as string]: fontStack(headingFont),
    ['--font-body' as string]: fontStack(bodyFont),
  } as React.CSSProperties;

  return (
    <html lang="en" className="h-full antialiased" style={cssVars}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {fontsHref && <link rel="stylesheet" href={fontsHref} />}
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
