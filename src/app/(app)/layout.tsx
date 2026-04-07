import type { ReactNode } from 'react'

import { signOutAction } from '@/app/(app)/actions'
import { AppShell } from '@/components/app-shell'
import { requireSession } from '@/lib/session'

type AppLayoutProps = {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await requireSession()

  const role = session.user.role
  const isStudent = role === 'STUDENT'
  const dashboardHref = isStudent ? '/student' : '/teacher'
  const navItems = isStudent
    ? [
        { href: '/student', label: 'Dashboard' },
        { href: '/student/practice-items', label: 'Practice items' },
        { href: '/student/sessions', label: 'Sessions' },
        { href: '/student/sessions/new', label: 'Log session' },
      ]
    : [
        { href: '/teacher', label: 'Dashboard' },
        { href: '/teacher/students', label: 'Students' },
        { href: '/teacher/assignments', label: 'Assignments' },
      ]

  const accountHref = isStudent ? '/student/account' : '/teacher/account'
  const displayName = session.user.name ?? session.user.email ?? 'Account'
  const roleLabel = role ? `${role.charAt(0)}${role.slice(1).toLowerCase()}` : 'Getting started'

  return (
    <AppShell
      title="RecorderLoop"
      subtitle="Structured practice between lessons."
      dashboardHref={dashboardHref}
      navItems={navItems}
      displayName={displayName}
      roleLabel={roleLabel}
      accountHref={accountHref}
      signOutSlot={
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950"
          >
            Sign out
          </button>
        </form>
      }
    >
      {children}
    </AppShell>
  )
}
