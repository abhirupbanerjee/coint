import type { ReactNode } from 'react'
import { Fraunces, Inter } from 'next/font/google'
import '../globals.css'

const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], display: 'swap' })
const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: { default: 'Admin', template: '%s | Cointelligence Admin' },
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  )
}
