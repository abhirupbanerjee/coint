import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getBranding } from '@/lib/branding'

export default async function FrontendLayout({
  children,
}: {
  children: ReactNode
}) {
  const { siteName, logo } = await getBranding()
  return (
    <div className="flex flex-col min-h-screen">
      <Header siteName={siteName} logoUrl={logo?.url ?? null} logoAlt={logo?.alt ?? null} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
