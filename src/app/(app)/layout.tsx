import Link from 'next/link'
import type { ReactNode } from 'react'

import { signOutAction } from '@/app/(app)/actions'
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
      ]
    : [
        { href: '/teacher', label: 'Dashboard' },
        { href: '/teacher/students', label: 'Students' },
        { href: '/teacher/assignments', label: 'Assignments' },
      ]

  const displayName = session.user.name ?? session.user.email ?? 'Account'
  const roleLabel = role ? `${role.charAt(0)}${role.slice(1).toLowerCase()}` : 'Getting started'

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <Link className="text-lg font-semibold tracking-tight" href={dashboardHref}>
              RecorderLoop
            </Link>
            <p className="text-sm text-neutral-600">
              Structured practice between lessons.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-neutral-300 hover:text-neutral-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
              <span>
                <span className="font-medium text-neutral-950">{displayName}</span>
                <span className="ml-2 rounded-full bg-neutral-100 px-2 py-1 text-xs uppercase tracking-wide text-neutral-600">
                  {roleLabel}
                </span>
              </span>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-neutral-300 hover:text-neutral-950"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
