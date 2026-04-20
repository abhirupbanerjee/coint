import type { ReactNode } from 'react'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/home', label: 'Home Page' },
  { href: '/admin/about', label: 'About' },
  { href: '/admin/work', label: 'Work' },
  { href: '/admin/co-intelligence', label: 'Co-Intelligence' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/submissions', label: 'Submissions' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 fixed top-0 left-0 h-screen">
        <div className="p-4 border-b border-gray-200">
          <Link href="/admin" className="text-lg font-serif font-bold text-gray-900">
            Cointelligence
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <Link href="/" className="block px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← View Site
          </Link>
          <Link href="/api/auth/signout" className="block px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}
