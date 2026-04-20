import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactSubmissions } from '@/lib/schema'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, type, articleSlug } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    await db.insert(contactSubmissions).values({
      name: String(name).slice(0, 300),
      email: String(email).slice(0, 300),
      message: String(message).slice(0, 5000),
      type: type || 'inquiry',
      articleSlug: articleSlug || null,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
