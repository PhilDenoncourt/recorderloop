import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { type UserRole } from '@prisma/client'

import { prisma } from '@/lib/prisma'

const resendKeyPrefix = process.env.RESEND_API_KEY?.slice(0, 6) ?? 'missing'
const authEmailFrom = process.env.AUTH_EMAIL_FROM ?? 'missing'
console.warn('[auth][warn] RESEND_API_KEY prefix:', resendKeyPrefix)
console.warn('[auth][warn] AUTH_EMAIL_FROM:', authEmailFrom)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  session: {
    strategy: 'database',
  },
  providers: [
    Resend({
      from: process.env.AUTH_EMAIL_FROM,
    }),
  ],
  callbacks: {
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
