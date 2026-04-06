import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

export async function getSession() {
  return auth()
}

export async function requireSession() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return session
}

export async function requireCompletedOnboarding() {
  const session = await requireSession()

  if (!session.user.role) {
    redirect('/onboarding')
  }

  return session
}
