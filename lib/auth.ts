import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { JWT } from 'next-auth/jwt'
import type { Account, Profile, User, Session } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: User & { id: string }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    email?: string | null
  }
}

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((e: string) => e.trim().toLowerCase())
  : []

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async signIn({ user }: { user: User; account: Account | null; profile?: Profile }): Promise<boolean> {
      return isAdminEmail(user.email)
    },
    async jwt({ token, user }: { token: JWT; user?: User; account?: Account | null }): Promise<JWT> {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
}
