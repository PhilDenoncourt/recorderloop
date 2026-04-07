import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { type UserRole } from '@prisma/client'

import { prisma } from '@/lib/prisma'

function getBaseUrl() {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.RENDER_EXTERNAL_URL ??
    undefined
  )
}

const authEmailFrom = process.env.AUTH_EMAIL_FROM

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  ...(getBaseUrl() ? { basePath: '/api/auth' } : {}),
  session: {
    strategy: 'database',
  },
  providers: [
    Resend({
      from: authEmailFrom,
    }),
  ],
  callbacks: {
    async signIn() {
      if (!authEmailFrom) {
        console.error('[auth] AUTH_EMAIL_FROM is not configured')
        return false
      }

      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = (user.role as UserRole | null | undefined) ?? null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
