import Link from 'next/link'

import { requireStudent } from '@/lib/permissions'
import { getStudentDashboardData } from '@/lib/queries/student-dashboard'

export default async function StudentDashboardPage() {
  const session = await requireStudent()
  const data = await getStudentDashboardData(session.user.id)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Student dashboard</h1>
        <p className="text-sm text-neutral-600">
          Your practice items, active assignments, and recent sessions all in one place.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm text-neutral-500">Teacher connection</p>
        <p className="mt-2 text-sm text-neutral-600">
          Need to link with a teacher? Use their invite code on the connect page.
        </p>
        <Link className="mt-4 inline-block text-sm underline underline-offset-4" href="/connect">
          Open connect page
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Active practice items</p>
          <p className="mt-2 text-3xl font-semibold">{data.practiceItems.length}</p>
          <Link className="mt-4 inline-block text-sm underline underline-offset-4" href="/student/practice-items">
            Manage practice items
          </Link>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Active assignments</p>
          <p className="mt-2 text-3xl font-semibold">{data.assignments.length}</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-neutral-500">Recent sessions</p>
          <p className="mt-2 text-3xl font-semibold">{data.recentSessions.length}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="underline underline-offset-4" href="/student/history">
              View history
            </Link>
            <Link className="underline underline-offset-4" href="/student/sessions/new">
              Log a session
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
            <h2 className="text-lg font-semibold">Current practice items</h2>
            {data.practiceItems.length > 0 ? (
              <Link
                href="/student/sessions/new"
                className="text-sm font-medium text-neutral-900 underline underline-offset-4"
              >
                Quick log
              </Link>
            ) : null}
          </div>

          {data.practiceItems.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No practice items yet.</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {data.practiceItems.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">{item.category}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
            <h2 className="text-lg font-semibold">Recent sessions</h2>
            <Link
              href="/student/history"
              className="text-sm font-medium text-neutral-900 underline underline-offset-4"
            >
              View history
            </Link>
          </div>

          {data.recentSessions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No sessions logged yet.</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {data.recentSessions.map((sessionItem) => (
                <li key={sessionItem.id} className="px-4 py-3">
                  <p className="font-medium">{new Date(sessionItem.sessionDate).toLocaleDateString()}</p>
                  <p className="text-sm text-neutral-600">
                    {sessionItem.durationMinutes ? `${sessionItem.durationMinutes} min` : 'Duration not set'}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {sessionItem.items.length} item{sessionItem.items.length === 1 ? '' : 's'} logged
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
