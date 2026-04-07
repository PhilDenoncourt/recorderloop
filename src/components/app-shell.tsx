'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
}

type AppShellProps = {
  title: string
  subtitle: string
  dashboardHref: string
  navItems: NavItem[]
  displayName: string
  roleLabel: string
  accountHref: string
  signOutSlot: ReactNode
  children: ReactNode
}

function isActivePath(pathname: string, href: string) {
  if (pathname === href) {
    return true
  }

  return href !== '/' && pathname.startsWith(`${href}/`)
}

export function AppShell({
  title,
  subtitle,
  dashboardHref,
  navItems,
  displayName,
  roleLabel,
  accountHref,
  signOutSlot,
  children,
}: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <Link className="text-lg font-semibold tracking-tight" href={dashboardHref}>
              {title}
            </Link>
            <p className="text-sm text-neutral-600">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
              {navItems.map((item) => {
                const isActive = isActivePath(pathname, item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:text-neutral-950',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-950">{displayName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] uppercase tracking-wide text-neutral-600 ring-1 ring-neutral-200">
                      {roleLabel}
                    </span>
                    <Link
                      href={accountHref}
                      className={cn(
                        'text-sm text-neutral-700 underline-offset-4 hover:text-neutral-950 hover:underline',
                        isActivePath(pathname, accountHref) && 'font-medium text-neutral-950 underline',
                      )}
                    >
                      Account
                    </Link>
                  </div>
                </div>
              </div>

              {signOutSlot}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
